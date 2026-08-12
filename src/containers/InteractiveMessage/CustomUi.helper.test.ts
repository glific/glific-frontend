import {
  buildCustomUiEnvelope,
  CUSTOM_UI_PRESETS,
  envelopeToEditorPayload,
  getCustomUiPreset,
  getEnvelopeSize,
  getJsonDepth,
  getPayloadSize,
  getPresetPayload,
  validateCustomUiPayload,
} from './CustomUi.helper';

const validImagePanel = JSON.stringify({
  component: 'glific/image_panel',
  props: {
    id: 'course',
    options: [{ id: 'c1', image: 'https://example.com/a.png', label: 'Spoken English' }],
  },
});

describe('validateCustomUiPayload — envelope rules (contract §7)', () => {
  test('accepts a valid glific block', () => {
    expect(validateCustomUiPayload(validImagePanel).valid).toBe(true);
  });

  test('rejects unparseable JSON', () => {
    const { valid, errors } = validateCustomUiPayload('{ not json');
    expect(valid).toBe(false);
    expect(errors[0].message).toMatch(/Invalid JSON/);
  });

  test('rejects a non-object payload', () => {
    expect(validateCustomUiPayload('[]').errors[0].message).toMatch(/must be a JSON object/);
  });

  test('rejects a missing component', () => {
    const { errors } = validateCustomUiPayload(JSON.stringify({ props: {} }));
    expect(errors.some((error) => error.path === 'component')).toBe(true);
  });

  test('rejects a component that does not match namespace/name', () => {
    const { errors } = validateCustomUiPayload(JSON.stringify({ component: 'ImagePanel', props: {} }));
    expect(errors[0].message).toMatch(/namespace\/name/);
  });

  test('rejects an unknown name in the reserved glific namespace', () => {
    const { errors } = validateCustomUiPayload(JSON.stringify({ component: 'glific/foo', props: {} }));
    expect(errors[0].message).toMatch(/glific\/ namespace is reserved/);
  });

  test('treats other namespaces as opaque — envelope validation only', () => {
    const payload = JSON.stringify({ component: 'tap/anything', props: { whatever: true } });
    expect(validateCustomUiPayload(payload).valid).toBe(true);
  });

  test('rejects a wrong envelope type or version', () => {
    expect(
      validateCustomUiPayload(JSON.stringify({ type: 'list', component: 'tap/a', props: {} })).errors[0].path
    ).toBe('type');
    expect(
      validateCustomUiPayload(JSON.stringify({ version: '2', component: 'tap/a', props: {} })).errors[0].path
    ).toBe('version');
  });

  test('rejects props that are not an object', () => {
    const { errors } = validateCustomUiPayload(JSON.stringify({ component: 'tap/a', props: [] }));
    expect(errors[0].path).toBe('props');
  });

  test('rejects a payload over 64 KB', () => {
    const payload = JSON.stringify({
      component: 'tap/a',
      props: { blob: 'x'.repeat(70 * 1024) },
    });
    const { errors } = validateCustomUiPayload(payload);
    expect(errors.some((error) => /the limit is 64 KB/.test(error.message))).toBe(true);
  });

  // §7 — the budget is spent by the assembled envelope, so the fallback text counts against it
  test('measures the assembled envelope, not the editor text', () => {
    const payload = JSON.stringify({ component: 'tap/a', props: { blob: 'x'.repeat(64 * 1024 - 120) } });

    expect(validateCustomUiPayload(payload, '').valid).toBe(true);
    expect(validateCustomUiPayload(payload, 'y'.repeat(500)).valid).toBe(false);
  });

  test('rejects a payload nested deeper than 10 levels', () => {
    let deep: any = 'leaf';
    for (let i = 0; i < 12; i += 1) deep = { nested: deep };
    const { errors } = validateCustomUiPayload(JSON.stringify({ component: 'tap/a', props: deep }));
    expect(errors.some((error) => /nested deeper than 10/.test(error.message))).toBe(true);
  });

  // §7 fixes the base: scalar = 0, each enclosing container adds 1. The assembled envelope is
  // itself one container, so props may nest 9 deep and no further.
  test('depth is measured on the same base as the backend', () => {
    const nest = (levels: number) => {
      let deep: any = 'leaf';
      for (let i = 0; i < levels; i += 1) deep = { nested: deep };
      return JSON.stringify({ component: 'tap/a', props: deep });
    };

    expect(getJsonDepth('leaf')).toBe(0);
    expect(getJsonDepth({ a: 1 })).toBe(1);
    expect(getJsonDepth({})).toBe(1);
    expect(getJsonDepth({ a: [{ b: 1 }] })).toBe(3);

    expect(validateCustomUiPayload(nest(9)).valid).toBe(true);
    expect(validateCustomUiPayload(nest(10)).valid).toBe(false);
  });
});

describe('validateCustomUiPayload — glific block schemas (contract §6)', () => {
  test('image_panel requires id and options', () => {
    const { errors } = validateCustomUiPayload(JSON.stringify({ component: 'glific/image_panel', props: {} }));
    expect(errors.map((error) => error.path)).toEqual(expect.arrayContaining(['props.id', 'props.options']));
  });

  test('image_panel names the offending option field', () => {
    const payload = JSON.stringify({
      component: 'glific/image_panel',
      props: { id: 'course', options: [{ id: 'c1', label: 'Spoken English' }] },
    });
    const { errors } = validateCustomUiPayload(payload);
    expect(errors[0].message).toBe('"props.options[0].image" is required');
  });

  test('image_panel caps options at 10', () => {
    const options = Array.from({ length: 11 }, (_, index) => ({
      id: `c${index}`,
      image: 'https://example.com/a.png',
      label: `Option ${index}`,
    }));
    const payload = JSON.stringify({ component: 'glific/image_panel', props: { id: 'course', options } });
    expect(validateCustomUiPayload(payload).errors[0].message).toMatch(/between 1 and 10/);
  });

  test('carousel requires cards with id, image and title', () => {
    const payload = JSON.stringify({
      component: 'glific/carousel',
      props: { id: 'product', cards: [{ id: 'p1', image: 'https://example.com/a.png' }] },
    });
    expect(validateCustomUiPayload(payload).errors[0].path).toBe('props.cards[0].title');
  });

  test('form requires fields and validates the required flag', () => {
    const payload = JSON.stringify({
      component: 'glific/form',
      props: { fields: [{ id: 'name', label: 'Your name', required: 'yes' }] },
    });
    expect(validateCustomUiPayload(payload).errors[0].path).toBe('props.fields[0].required');
  });

  // §6 — unknown keys are rejected in props and in every item, same as the backend
  test('rejects an unknown key in props', () => {
    const payload = JSON.stringify({
      component: 'glific/image_panel',
      props: {
        id: 'course',
        header: 'nope',
        options: [{ id: 'c1', image: 'https://example.com/a.png', label: 'Spoken English' }],
      },
    });
    const { errors } = validateCustomUiPayload(payload);
    expect(errors).toEqual([{ path: 'props.header', message: '"props.header" is not a known key' }]);
  });

  test('rejects an unknown key inside an option, card or field', () => {
    const optionErrors = validateCustomUiPayload(
      JSON.stringify({
        component: 'glific/image_panel',
        props: { id: 'course', options: [{ id: 'c1', image: 'https://x/a.png', label: 'A', subtitle: 'nope' }] },
      })
    ).errors;
    expect(optionErrors[0].message).toBe('"props.options[0].subtitle" is not a known key');

    const cardErrors = validateCustomUiPayload(
      JSON.stringify({
        component: 'glific/carousel',
        props: { id: 'p', cards: [{ id: 'p1', image: 'https://x/a.png', title: 'A', price: '10' }] },
      })
    ).errors;
    expect(cardErrors[0].message).toBe('"props.cards[0].price" is not a known key');

    const fieldErrors = validateCustomUiPayload(
      JSON.stringify({
        component: 'glific/form',
        props: { fields: [{ id: 'name', label: 'Your name', maxlength: 10 }] },
      })
    ).errors;
    expect(fieldErrors[0].message).toBe('"props.fields[0].maxlength" is not a known key');
  });

  test('keeps the known optional keys of every item', () => {
    const payload = JSON.stringify({
      component: 'glific/form',
      props: {
        id: 'signup',
        body: 'About you',
        submit_label: 'Go',
        fields: [{ id: 'name', label: 'Your name', placeholder: 'Asha', required: true }],
      },
    });
    expect(validateCustomUiPayload(payload).errors).toEqual([]);
  });

  // §6 — duplicate ids silently lose an answer in the widget (React keys and the values map)
  test('rejects duplicate item ids', () => {
    const duplicate = (component: string, key: string, items: any[]) =>
      validateCustomUiPayload(JSON.stringify({ component, props: { id: 'x', [key]: items } })).errors;

    expect(
      duplicate('glific/image_panel', 'options', [
        { id: 'c1', image: 'https://x/a.png', label: 'A' },
        { id: 'c1', image: 'https://x/b.png', label: 'B' },
      ])[0]
    ).toEqual({ path: 'props.options[1].id', message: '"props.options[1].id" must be unique' });

    expect(
      duplicate('glific/carousel', 'cards', [
        { id: 'p1', image: 'https://x/a.png', title: 'A' },
        { id: 'p1', image: 'https://x/b.png', title: 'B' },
      ])[0].path
    ).toBe('props.cards[1].id');

    expect(
      validateCustomUiPayload(
        JSON.stringify({
          component: 'glific/form',
          props: {
            fields: [
              { id: 'name', label: 'Your name' },
              { id: 'name', label: 'Again' },
            ],
          },
        })
      ).errors[0].path
    ).toBe('props.fields[1].id');
  });

  test('every built-in preset is valid out of the box', () => {
    CUSTOM_UI_PRESETS.forEach((preset) => {
      const result = validateCustomUiPayload(getPresetPayload(preset.id));
      expect(result.errors).toEqual([]);
    });
  });

  test('block presets carry a suggested fallback', () => {
    CUSTOM_UI_PRESETS.filter((preset) => preset.id.startsWith('glific/')).forEach((preset) => {
      expect(preset.fallback).not.toBe('');
    });
  });
});

describe('buildCustomUiEnvelope', () => {
  test('always injects type and version and puts keys in contract order', () => {
    const envelope = buildCustomUiEnvelope(validImagePanel, 'Pick a course');
    expect(Object.keys(envelope)).toEqual(['type', 'version', 'component', 'props', 'fallback']);
    expect(envelope.type).toBe('custom_ui');
    expect(envelope.version).toBe('1');
    expect(envelope.fallback).toBe('Pick a course');
  });

  test('overrides a type the author tried to smuggle in', () => {
    const envelope = buildCustomUiEnvelope(JSON.stringify({ type: 'list', component: 'tap/a', props: {} }), 'hi');
    expect(envelope.type).toBe('custom_ui');
  });

  test('keeps context when present and omits it otherwise', () => {
    const withContext = buildCustomUiEnvelope(
      JSON.stringify({ component: 'tap/a', props: {}, context: { source: 'x' } }),
      'hi'
    );
    expect(withContext.context).toEqual({ source: 'x' });
    expect('context' in buildCustomUiEnvelope(validImagePanel, 'hi')).toBe(false);
  });

  test('degrades to an empty envelope for unparseable input', () => {
    expect(buildCustomUiEnvelope('{oops', 'hi').component).toBe('');
  });
});

describe('envelopeToEditorPayload', () => {
  test('strips the fields the language tabs own', () => {
    const editorPayload = JSON.parse(
      envelopeToEditorPayload({
        type: 'custom_ui',
        version: '1',
        component: 'glific/form',
        props: { fields: [] },
        fallback: 'text',
      })
    );
    expect(editorPayload).toEqual({ component: 'glific/form', props: { fields: [] } });
  });
});

describe('misc helpers', () => {
  test('getPayloadSize counts bytes, not characters', () => {
    expect(getPayloadSize('abc')).toBe(3);
    expect(getPayloadSize('कोर्स')).toBeGreaterThan(5);
  });

  test('getEnvelopeSize measures the compact assembled envelope', () => {
    const pretty = JSON.stringify({ component: 'tap/a', props: { a: 1 } }, null, 2);
    const expected = getPayloadSize(JSON.stringify(buildCustomUiEnvelope(pretty, 'Fallback text')));

    expect(getEnvelopeSize(pretty, 'Fallback text')).toBe(expected);
    // the pretty-printed editor text is not what is measured
    expect(getEnvelopeSize(pretty, 'Fallback text')).not.toBe(getPayloadSize(pretty));
  });

  test('getCustomUiPreset looks up by component name', () => {
    expect(getCustomUiPreset('glific/carousel')?.label).toBe('Carousel');
    expect(getCustomUiPreset('nope')).toBeUndefined();
  });

  test('getPresetPayload falls back to Blank for an unknown id', () => {
    expect(JSON.parse(getPresetPayload('nope')).component).toBe('org/my_component');
  });
});
