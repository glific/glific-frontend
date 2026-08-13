import {
  BLOCKS_PRESETS,
  buildBlocksEnvelope,
  clampText,
  deriveBody,
  envelopeToEditorPayload,
  getComponentLabel,
  getJsonDepth,
  getPayloadSize,
  getPresetPayload,
  getTypedSize,
  getUnwrappedSize,
  isTypedNode,
  RESERVED_IDS,
  unwrap,
  validateBlocksPayload,
} from './Blocks.helper';

const T = (value: string) => ({ kind: 'text', value });
const A = (value: string) => ({ kind: 'alt', value });
const I = (value: string) => ({ kind: 'image', value });
const L = (value: any[]) => ({ kind: 'list', value });

const imagePanelProps = {
  id: 'course',
  body: T('Pick a course'),
  options: L([
    { id: 'c1', image: I('https://example.com/a.png'), image_alt: A('A class'), label: T('Spoken English') },
  ]),
};

const payloadFor = (props: any) => JSON.stringify({ props });

describe('unwrap (contract §2.2)', () => {
  test('collapses every typed node to exactly its value, recursively', () => {
    expect(unwrap(T('hi'))).toBe('hi');
    expect(unwrap({ a: T('hi'), b: I('https://x/a.png') })).toEqual({ a: 'hi', b: 'https://x/a.png' });
    expect(unwrap(L([{ id: 'c1', label: T('A') }]))).toEqual([{ id: 'c1', label: 'A' }]);
  });

  test('is uniform — a node with translate collapses the same way', () => {
    expect(unwrap({ kind: 'text', value: 'brand', translate: false })).toBe('brand');
  });

  test('leaves plain maps, arrays and scalars alone', () => {
    expect(unwrap({ type: 'blocks', version: 1 })).toEqual({ type: 'blocks', version: 1 });
    expect(unwrap([1, 'a', null])).toEqual([1, 'a', null]);
    expect(unwrap(null)).toBe(null);
  });

  test('does not collapse the envelope itself — the node key is kind, not type', () => {
    const envelope = { type: 'blocks', version: 1, component: 'glific/form', props: { body: T('hi') } };
    expect(unwrap(envelope)).toEqual({
      type: 'blocks',
      version: 1,
      component: 'glific/form',
      props: { body: 'hi' },
    });
  });

  test('is idempotent, so an already-unwrapped message passes through', () => {
    const unwrapped = unwrap({ props: imagePanelProps });
    expect(unwrap(unwrapped)).toEqual(unwrapped);
  });

  test('a map carrying extra keys beside kind/value is a plain value', () => {
    expect(isTypedNode({ kind: 'text', value: 'x', extra: 1 })).toBe(false);
    expect(unwrap({ kind: 'text', value: 'x', extra: 1 })).toEqual({ kind: 'text', value: 'x', extra: 1 });
  });
});

describe('deriveBody (contract §9)', () => {
  test('joins text nodes in document order with an em dash', () => {
    const envelope = buildBlocksEnvelope(payloadFor(imagePanelProps), 'glific/image-panel');
    expect(deriveBody(envelope)).toBe('Pick a course — Spoken English');
  });

  test('skips alt nodes so accessibility metadata stays out of the preview', () => {
    expect(deriveBody({ props: { image_alt: A('A class'), label: T('Spoken English') } })).toBe('Spoken English');
  });

  test('skips image, url, number and boolean nodes', () => {
    const props = {
      image: I('https://x/a.png'),
      link: { kind: 'url', value: 'https://x' },
      count: { kind: 'number', value: 3 },
      flag: { kind: 'boolean', value: true },
    };
    expect(deriveBody({ props })).toBe('');
  });

  test('drops blank text nodes so a doubled em dash cannot appear', () => {
    expect(deriveBody({ props: { a: T('One'), b: T('   '), c: T(''), d: T('Two') } })).toBe('One — Two');
  });

  test('clamps to 500 chars', () => {
    expect(deriveBody({ props: { a: T('x'.repeat(600)) } })).toHaveLength(500);
  });

  test('returns an empty string when there are no text nodes', () => {
    expect(deriveBody({ props: {} })).toBe('');
  });
});

describe('clampText', () => {
  test('does not split a UTF-16 surrogate pair', () => {
    const emoji = '😀'.repeat(300);
    const clamped = clampText(emoji, 501);
    expect(clamped.length).toBe(500);
    expect([...clamped].every((char) => char === '😀')).toBe(true);
  });
});

describe('validateBlocksPayload — envelope rules (contract §7)', () => {
  test('accepts a valid glific block', () => {
    expect(validateBlocksPayload(payloadFor(imagePanelProps), 'glific/image-panel').valid).toBe(true);
  });

  test('rejects unparseable JSON', () => {
    const { valid, errors } = validateBlocksPayload('{ not json');
    expect(valid).toBe(false);
    expect(errors[0].message).toMatch(/Invalid JSON/);
  });

  test('rejects a non-object payload', () => {
    expect(validateBlocksPayload('[]').errors[0].message).toMatch(/must be a JSON object/);
  });

  test('rejects a missing component', () => {
    const { errors } = validateBlocksPayload(JSON.stringify({ props: {} }));
    expect(errors.some((error) => error.path === 'component')).toBe(true);
  });

  // §6 — DNS label syntax, two segments, no underscores
  test('rejects a component that does not match the DNS regex', () => {
    expect(validateBlocksPayload(JSON.stringify({ component: 'ImagePanel', props: {} })).errors[0].message).toMatch(
      /namespace\/name/
    );
    expect(
      validateBlocksPayload(JSON.stringify({ component: 'glific/image_panel', props: {} })).errors[0].message
    ).toMatch(/namespace\/name/);
    expect(validateBlocksPayload(JSON.stringify({ component: 'org/-lead', props: {} })).errors[0].message).toMatch(
      /namespace\/name/
    );
  });

  test('rejects an unknown name in the reserved glific namespace', () => {
    const { errors } = validateBlocksPayload(JSON.stringify({ component: 'glific/foo', props: {} }));
    expect(errors[0].message).toMatch(/glific\/ namespace is reserved/);
  });

  test('rejects a Custom Block that claims the glific namespace', () => {
    const { errors } = validateBlocksPayload(JSON.stringify({ component: 'glific/carousel', props: {} }));
    expect(errors[0].message).toMatch(/must use your own namespace/);
  });

  test('treats other namespaces as opaque — envelope and typed-node validation only', () => {
    const payload = JSON.stringify({ component: 'tap/anything', props: { whatever: true, deep: { nested: 1 } } });
    expect(validateBlocksPayload(payload).valid).toBe(true);
  });

  test('rejects props that are not an object', () => {
    const { errors } = validateBlocksPayload(JSON.stringify({ component: 'tap/a', props: [] }));
    expect(errors[0].path).toBe('props');
  });

  // §7 — 64 KB on the UNWRAPPED envelope, 128 KB on the stored typed one
  test('measures the 64 KB cap on the unwrapped envelope', () => {
    const props = { blob: T('x'.repeat(70 * 1024)) };
    const { errors } = validateBlocksPayload(JSON.stringify({ component: 'tap/a', props }));
    expect(errors.some((error) => /the limit is 64 KB/.test(error.message))).toBe(true);
  });

  test('the typed wrapper does not count against the 64 KB cap', () => {
    // 2000 tiny text nodes: cheap unwrapped, but each carries ~30 bytes of typed wrapper
    const props: any = {};
    for (let i = 0; i < 2000; i += 1) props[`k${i}`] = T('ab');
    const envelope = buildBlocksEnvelope(JSON.stringify({ component: 'tap/a', props }), null);

    expect(getUnwrappedSize(envelope)).toBeLessThan(64 * 1024);
    expect(getTypedSize(envelope)).toBeGreaterThan(getUnwrappedSize(envelope) * 2);
    expect(validateBlocksPayload(JSON.stringify({ component: 'tap/a', props })).valid).toBe(true);
  });

  test('rejects a stored typed payload over 128 KB', () => {
    const props: any = {};
    for (let i = 0; i < 4000; i += 1) props[`key${i}`] = T('x'.repeat(6));
    const { errors } = validateBlocksPayload(JSON.stringify({ component: 'tap/a', props }));
    expect(errors.some((error) => /the limit is 128 KB/.test(error.message))).toBe(true);
  });

  // §7 fixes the base: scalar = 0, each enclosing container adds 1
  test('depth is measured on the unwrapped payload, on the backend base', () => {
    expect(getJsonDepth('leaf')).toBe(0);
    expect(getJsonDepth({ a: 1 })).toBe(1);
    expect(getJsonDepth({})).toBe(1);
    expect(getJsonDepth({ a: [{ b: 1 }] })).toBe(3);

    const nest = (levels: number) => {
      let deep: any = 'leaf';
      for (let i = 0; i < levels; i += 1) deep = { nested: deep };
      return JSON.stringify({ component: 'tap/a', props: deep });
    };

    // the envelope is itself one container, so props may nest 9 deep and no further
    expect(validateBlocksPayload(nest(9)).valid).toBe(true);
    expect(validateBlocksPayload(nest(10)).errors.some((e) => /nested deeper than 10/.test(e.message))).toBe(true);
  });

  test('a typed wrapper does not consume depth budget', () => {
    // three typed nodes nested through lists unwrap to three plain containers
    const props = { a: L([{ id: 'x', b: L([{ id: 'y', c: T('deep') }]) }]) };
    expect(getJsonDepth(unwrap(props))).toBeLessThan(getJsonDepth(props));
  });
});

describe('validateBlocksPayload — typed nodes (contract §2.1)', () => {
  test('rejects an unknown kind', () => {
    const { errors } = validateBlocksPayload(
      JSON.stringify({ component: 'tap/a', props: { a: { kind: 'rich', value: 'x' } } })
    );
    expect(errors[0].message).toMatch(/must be one of text, alt, image, url, number, boolean, list/);
  });

  test('accepts alt as a kind', () => {
    expect(validateBlocksPayload(JSON.stringify({ component: 'tap/a', props: { a: A('x') } })).valid).toBe(true);
  });

  test('checks value against the kind', () => {
    const bad = (node: any) =>
      validateBlocksPayload(JSON.stringify({ component: 'tap/a', props: { a: node } })).errors[0].message;

    expect(bad({ kind: 'text', value: 3 })).toMatch(/must be a string/);
    expect(bad({ kind: 'image', value: 'not-a-url' })).toMatch(/absolute http\(s\) URL/);
    expect(bad({ kind: 'url', value: 'ftp://x' })).toMatch(/absolute http\(s\) URL/);
    expect(bad({ kind: 'number', value: '3' })).toMatch(/must be a number/);
    expect(bad({ kind: 'boolean', value: 'yes' })).toMatch(/must be true or false/);
    expect(bad({ kind: 'list', value: {} })).toMatch(/must be an array/);
  });

  test('rejects keys beyond kind/value/translate on a node that carries kind', () => {
    const { errors } = validateBlocksPayload(
      JSON.stringify({ component: 'tap/a', props: { a: { kind: 'text', val: 'oops' } } })
    );
    expect(errors[0].message).toMatch(/carries "kind" so it must be a typed node/);
  });

  test('validates translate but ignores its effect', () => {
    expect(
      validateBlocksPayload(
        JSON.stringify({ component: 'tap/a', props: { a: { kind: 'text', value: 'x', translate: false } } })
      ).valid
    ).toBe(true);
    expect(
      validateBlocksPayload(
        JSON.stringify({ component: 'tap/a', props: { a: { kind: 'text', value: 'x', translate: 'no' } } })
      ).errors[0].path
    ).toBe('props.a.translate');
  });
});

describe('validateBlocksPayload — reserved ids (contract §5.1)', () => {
  test.each(RESERVED_IDS)('rejects "%s" as props.id', (reserved) => {
    const { errors } = validateBlocksPayload(JSON.stringify({ component: 'tap/a', props: { id: reserved } }));
    expect(errors[0].message).toMatch(/is a reserved id/);
  });

  test('rejects a reserved id on an option, card or field', () => {
    const optionErrors = validateBlocksPayload(
      payloadFor({
        id: 'course',
        options: L([{ id: 'input', image: I('https://x/a.png'), label: T('A') }]),
      }),
      'glific/image-panel'
    ).errors;
    expect(optionErrors[0].message).toMatch(/is a reserved id/);

    const fieldErrors = validateBlocksPayload(
      payloadFor({ fields: L([{ id: 'summary', label: T('Your name') }]) }),
      'glific/form'
    ).errors;
    expect(fieldErrors[0].message).toMatch(/is a reserved id/);
  });

  test('names the full reserved set in the message', () => {
    const { errors } = validateBlocksPayload(JSON.stringify({ component: 'tap/a', props: { id: 'value' } }));
    expect(errors[0].message).toContain('input, category, inserted_at, summary, component, value');
  });

  test('an id must be a non-blank string', () => {
    expect(validateBlocksPayload(JSON.stringify({ component: 'tap/a', props: { id: 7 } })).errors[0].message).toMatch(
      /must be a string/
    );
  });

  test('reports a reserved props.id exactly once', () => {
    const { errors } = validateBlocksPayload(
      payloadFor({ id: 'input', fields: L([{ id: 'name', label: T('N') }]) }),
      'glific/form'
    );
    expect(errors.filter((error) => /is a reserved id/.test(error.message))).toHaveLength(1);
  });

  test('uniqueness spans the whole block, not one list at a time', () => {
    const { errors } = validateBlocksPayload(
      JSON.stringify({
        component: 'tap/a',
        props: { rows: L([{ id: 'c1' }]), extras: L([{ id: 'c1' }]) },
      })
    );
    expect(errors[0].message).toMatch(/must be unique within the block/);
  });

  test('rejects duplicate ids within a block', () => {
    const { errors } = validateBlocksPayload(
      payloadFor({
        id: 'course',
        options: L([
          { id: 'c1', image: I('https://x/a.png'), label: T('A') },
          { id: 'c1', image: I('https://x/b.png'), label: T('B') },
        ]),
      }),
      'glific/image-panel'
    );
    expect(errors[0]).toEqual({
      path: 'props.options[1].id',
      message: '"props.options[1].id" must be unique within the block',
    });
  });
});

describe('validateBlocksPayload — glific block schemas (contract §6)', () => {
  test('image-panel requires id and options', () => {
    const { errors } = validateBlocksPayload(payloadFor({}), 'glific/image-panel');
    expect(errors.map((error) => error.path)).toEqual(expect.arrayContaining(['props.id', 'props.options']));
  });

  test('image-panel names the offending option field', () => {
    const { errors } = validateBlocksPayload(
      payloadFor({ id: 'course', options: L([{ id: 'c1', label: T('A') }]) }),
      'glific/image-panel'
    );
    expect(errors[0].message).toBe('"props.options[0].image" is required');
  });

  // §6 — an item id is required for the built-in blocks…
  test('image-panel requires an id on every option', () => {
    const { errors } = validateBlocksPayload(
      payloadFor({ id: 'course', options: L([{ image: I('https://x/a.png'), label: T('A') }]) }),
      'glific/image-panel'
    );
    expect(errors[0]).toEqual({ path: 'props.options[0].id', message: '"props.options[0].id" is required' });
  });

  // …but a Custom Block's props are opaque, so the console must not invent a schema for them
  test('a Custom Block list item needs no id', () => {
    const payload = JSON.stringify({
      component: 'tap/a',
      props: { rows: L([{ label: T('x') }]) },
    });
    expect(validateBlocksPayload(payload)).toMatchObject({ valid: true });
  });

  test('a list prop must be a list node, not a bare array', () => {
    const { errors } = validateBlocksPayload(
      payloadFor({ id: 'course', options: [{ id: 'c1', image: I('https://x/a.png'), label: T('A') }] }),
      'glific/image-panel'
    );
    expect(errors[0].message).toMatch(/must be a \{ "kind": "list"/);
  });

  test('image-panel caps options at 10', () => {
    const options = Array.from({ length: 11 }, (_, index) => ({
      id: `c${index}`,
      image: I('https://example.com/a.png'),
      label: T(`Option ${index}`),
    }));
    const { errors } = validateBlocksPayload(payloadFor({ id: 'course', options: L(options) }), 'glific/image-panel');
    expect(errors.some((error) => /between 1 and 10/.test(error.message))).toBe(true);
  });

  test('carousel requires cards with id, image and title', () => {
    const { errors } = validateBlocksPayload(
      payloadFor({ id: 'product', cards: L([{ id: 'p1', image: I('https://example.com/a.png') }]) }),
      'glific/carousel'
    );
    expect(errors[0].path).toBe('props.cards[0].title');
  });

  test('form validates the required flag as a boolean node', () => {
    const { errors } = validateBlocksPayload(
      payloadFor({ fields: L([{ id: 'name', label: T('Your name'), required: true }]) }),
      'glific/form'
    );
    expect(errors[0].path).toBe('props.fields[0].required');
  });

  // §6 — unknown keys are rejected in props and in every item, same as the backend
  test('rejects an unknown key in props', () => {
    const { errors } = validateBlocksPayload(
      payloadFor({ ...imagePanelProps, header: T('nope') }),
      'glific/image-panel'
    );
    expect(errors).toEqual([{ path: 'props.header', message: '"props.header" is not a known key' }]);
  });

  test('rejects an unknown key inside an option, card or field', () => {
    expect(
      validateBlocksPayload(
        payloadFor({
          id: 'course',
          options: L([{ id: 'c1', image: I('https://x/a.png'), label: T('A'), subtitle: T('nope') }]),
        }),
        'glific/image-panel'
      ).errors[0].message
    ).toBe('"props.options[0].subtitle" is not a known key');

    expect(
      validateBlocksPayload(
        payloadFor({ id: 'p', cards: L([{ id: 'p1', image: I('https://x/a.png'), title: T('A'), price: T('10') }]) }),
        'glific/carousel'
      ).errors[0].message
    ).toBe('"props.cards[0].price" is not a known key');

    expect(
      validateBlocksPayload(
        payloadFor({ fields: L([{ id: 'name', label: T('Your name'), maxlength: { kind: 'number', value: 10 } }]) }),
        'glific/form'
      ).errors[0].message
    ).toBe('"props.fields[0].maxlength" is not a known key');
  });

  test('keeps the known optional keys of every item', () => {
    const { errors } = validateBlocksPayload(
      payloadFor({
        id: 'signup',
        body: T('About you'),
        submit_label: T('Go'),
        fields: L([
          { id: 'name', label: T('Your name'), placeholder: T('Asha'), required: { kind: 'boolean', value: true } },
        ]),
      }),
      'glific/form'
    );
    expect(errors).toEqual([]);
  });

  test('every preset is valid out of the box', () => {
    Object.keys(BLOCKS_PRESETS).forEach((component) => {
      expect(validateBlocksPayload(getPresetPayload(component), component).errors).toEqual([]);
    });
    expect(validateBlocksPayload(getPresetPayload(null), null).errors).toEqual([]);
  });

  test('the image-panel and carousel presets use alt nodes for image_alt', () => {
    expect(BLOCKS_PRESETS['glific/image-panel'].props.options.value[0].image_alt.kind).toBe('alt');
    expect(BLOCKS_PRESETS['glific/carousel'].props.cards.value[0].image_alt.kind).toBe('alt');
  });
});

describe('buildBlocksEnvelope', () => {
  test('always injects type and version and puts keys in contract order', () => {
    const envelope = buildBlocksEnvelope(payloadFor(imagePanelProps), 'glific/image-panel');
    expect(Object.keys(envelope)).toEqual(['type', 'version', 'component', 'props']);
    expect(envelope.type).toBe('blocks');
    expect(envelope.version).toBe(1);
    expect(envelope.component).toBe('glific/image-panel');
  });

  test('the selector component wins over one smuggled into the payload', () => {
    const envelope = buildBlocksEnvelope(
      JSON.stringify({ type: 'list', component: 'org/other', props: {} }),
      'glific/form'
    );
    expect(envelope.type).toBe('blocks');
    expect(envelope.component).toBe('glific/form');
  });

  test('a Custom Block takes its component from the payload', () => {
    expect(buildBlocksEnvelope(JSON.stringify({ component: 'tap/a', props: {} }), null).component).toBe('tap/a');
  });

  test('keeps context when present and omits it otherwise', () => {
    const withContext = buildBlocksEnvelope(
      JSON.stringify({ component: 'tap/a', props: {}, context: { source: 'x' } })
    );
    expect(withContext.context).toEqual({ source: 'x' });
    expect('context' in buildBlocksEnvelope(payloadFor(imagePanelProps), 'glific/image-panel')).toBe(false);
  });

  test('degrades to an empty envelope for unparseable input', () => {
    expect(buildBlocksEnvelope('{oops').component).toBe('');
  });
});

describe('envelopeToEditorPayload', () => {
  test('shows props only for a built-in block', () => {
    const editorPayload = JSON.parse(
      envelopeToEditorPayload({ type: 'blocks', version: 1, component: 'glific/form', props: { fields: L([]) } })
    );
    expect(editorPayload).toEqual({ props: { fields: L([]) } });
  });

  test('shows the component too for a Custom Block', () => {
    const editorPayload = JSON.parse(
      envelopeToEditorPayload({ type: 'blocks', version: 1, component: 'tap/a', props: {} }, true)
    );
    expect(editorPayload).toEqual({ component: 'tap/a', props: {} });
  });
});

describe('misc helpers', () => {
  test('getPayloadSize counts bytes, not characters', () => {
    expect(getPayloadSize('abc')).toBe(3);
    expect(getPayloadSize('कोर्स')).toBeGreaterThan(5);
  });

  test('getPresetPayload falls back to the Custom Block preset', () => {
    expect(JSON.parse(getPresetPayload(null)).component).toBe('org/my-block');
    expect(JSON.parse(getPresetPayload('nope')).component).toBe('org/my-block');
  });

  test('getComponentLabel names the built-ins and calls the rest Custom Block', () => {
    expect(getComponentLabel('glific/image-panel')).toBe('Image panel');
    expect(getComponentLabel('glific/carousel')).toBe('Carousel');
    expect(getComponentLabel('glific/form')).toBe('Form');
    expect(getComponentLabel('tap/whatever')).toBe('Custom Block');
    expect(getComponentLabel(undefined)).toBe('Custom Block');
  });
});
