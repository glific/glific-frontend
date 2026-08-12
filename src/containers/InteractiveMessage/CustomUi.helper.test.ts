import {
  buildCustomUiEnvelope,
  CUSTOM_UI_PRESETS,
  envelopeToEditorPayload,
  getCustomUiPreset,
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

  test('rejects a payload nested deeper than 10 levels', () => {
    let deep: any = 'leaf';
    for (let i = 0; i < 12; i += 1) deep = { nested: deep };
    const { errors } = validateCustomUiPayload(JSON.stringify({ component: 'tap/a', props: deep }));
    expect(errors.some((error) => /nested deeper than 10/.test(error.message))).toBe(true);
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

  test('getCustomUiPreset looks up by component name', () => {
    expect(getCustomUiPreset('glific/carousel')?.label).toBe('Carousel');
    expect(getCustomUiPreset('nope')).toBeUndefined();
  });

  test('getPresetPayload falls back to Blank for an unknown id', () => {
    expect(JSON.parse(getPresetPayload('nope')).component).toBe('org/my_component');
  });
});
