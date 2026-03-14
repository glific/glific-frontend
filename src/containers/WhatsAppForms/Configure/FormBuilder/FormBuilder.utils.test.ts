import { describe, expect, test } from 'vitest';
import {
  convertFlowJSONToFormBuilder,
  convertFormBuilderToFlowJSON,
  computeFieldNames,
  hasContentItemError,
  validateFlowJson,
} from './FormBuilder.utils';

// ── Fixture: a realistic Flow JSON with unsupported types, custom IDs, and data ──

const fixtureFlowJSON = {
  version: '7.3',
  screens: [
    {
      id: 'my_custom_screen',
      title: 'Registration',
      terminal: false,
      data: {
        custom_prop: { type: 'string', __example__: 'hello' },
      },
      layout: {
        type: 'SingleColumnLayout',
        children: [
          {
            type: 'Form',
            name: 'flow_path',
            children: [
              { type: 'TextHeading', text: 'Welcome' },
              { type: 'TextInput', name: 'user_name', label: 'Name', required: true, 'input-type': 'text' },
              { type: 'CalendarPicker', name: 'cal_pick', label: 'Pick a date' },
              { type: 'ChipsSelector', name: 'chips_sel', label: 'Pick chips', 'data-source': [{ id: '1', title: 'A' }] },
              { type: 'EmbeddedLink', text: 'Click here', src: 'https://example.com' },
              { type: 'RichText', text: ['Hello ', { bold: true, text: 'World' }] },
              { type: 'If', condition: '${data.flag}', then: [{ type: 'TextBody', text: 'Yes' }], else: [{ type: 'TextBody', text: 'No' }] },
              { type: 'Switch', value: '${data.status}', cases: { open: [{ type: 'TextBody', text: 'Open' }] } },
              { type: 'PhotoPicker', name: 'photo_pick', label: 'Upload Photo' },
              { type: 'DocumentPicker', name: 'doc_pick', label: 'Upload Doc' },
              { type: 'Footer', label: '${data.custom_prop}', 'on-click-action': { name: 'navigate', next: { name: 'final_screen', type: 'screen' }, payload: {} } },
            ],
          },
        ],
      },
    },
    {
      id: 'final_screen',
      title: 'Thank You',
      terminal: true,
      data: {},
      layout: {
        type: 'SingleColumnLayout',
        children: [
          {
            type: 'Form',
            name: 'flow_path',
            children: [
              { type: 'TextBody', text: 'Thanks!' },
              { type: 'Footer', label: 'Done', 'on-click-action': { name: 'complete', payload: {} } },
            ],
          },
        ],
      },
    },
  ],
};

// ── Tests ──

describe('convertFlowJSONToFormBuilder + convertFormBuilderToFlowJSON round-trip', () => {
  test('preserves screen IDs through import→export', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const exported = convertFormBuilderToFlowJSON(screens);
    expect(exported.screens[0].id).toBe('my_custom_screen');
    expect(exported.screens[1].id).toBe('final_screen');
  });

  test('preserves screen.data declarations through import→export', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const exported = convertFormBuilderToFlowJSON(screens);
    expect(exported.screens[0].data).toHaveProperty('custom_prop');
    expect(exported.screens[0].data.custom_prop).toEqual({ type: 'string', __example__: 'hello' });
  });

  test('preserves Footer label with dynamic expression exactly', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const exported = convertFormBuilderToFlowJSON(screens);
    const footer = exported.screens[0].layout.children[0].children.find((c: any) => c.type === 'Footer');
    expect(footer.label).toBe('${data.custom_prop}');
  });

  test('stores the Footer label on the screen.buttonLabel without alteration', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    expect(screens[0].buttonLabel).toBe('${data.custom_prop}');
  });
});

describe('Unsupported component import', () => {
  const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
  const unsupported = screens[0].content.filter((item) => item.type === 'Unsupported');

  test('imports CalendarPicker as Unsupported with raw JSON', () => {
    const cal = unsupported.find((i) => i.name === 'CalendarPicker');
    expect(cal).toBeDefined();
    expect(cal!.data.rawComponent?.type).toBe('CalendarPicker');
    expect(cal!.data.rawComponent?.name).toBe('cal_pick');
  });

  test('imports ChipsSelector as Unsupported with raw JSON', () => {
    const chip = unsupported.find((i) => i.name === 'ChipsSelector');
    expect(chip).toBeDefined();
    expect(chip!.data.rawComponent?.type).toBe('ChipsSelector');
  });

  test('imports EmbeddedLink as Unsupported', () => {
    const link = unsupported.find((i) => i.name === 'EmbeddedLink');
    expect(link).toBeDefined();
    expect(link!.data.rawComponent?.src).toBe('https://example.com');
  });

  test('imports RichText as Unsupported', () => {
    const rt = unsupported.find((i) => i.name === 'RichText');
    expect(rt).toBeDefined();
    expect(rt!.data.rawComponent?.text).toEqual(['Hello ', { bold: true, text: 'World' }]);
  });

  test('imports If with nested children as Unsupported (preserves structure)', () => {
    const ifComp = unsupported.find((i) => i.name === 'If');
    expect(ifComp).toBeDefined();
    expect(ifComp!.data.rawComponent?.then).toHaveLength(1);
    expect(ifComp!.data.rawComponent?.else).toHaveLength(1);
  });

  test('imports Switch with nested children as Unsupported (preserves structure)', () => {
    const sw = unsupported.find((i) => i.name === 'Switch');
    expect(sw).toBeDefined();
    expect(sw!.data.rawComponent?.cases?.open).toHaveLength(1);
  });

  test('imports PhotoPicker as Unsupported with raw JSON', () => {
    const photo = unsupported.find((i) => i.name === 'PhotoPicker');
    expect(photo).toBeDefined();
    expect(photo!.data.rawComponent?.name).toBe('photo_pick');
  });

  test('imports DocumentPicker as Unsupported with raw JSON', () => {
    const doc = unsupported.find((i) => i.name === 'DocumentPicker');
    expect(doc).toBeDefined();
    expect(doc!.data.rawComponent?.name).toBe('doc_pick');
  });
});

describe('Unsupported component round-trip export', () => {
  test('re-exports all 8 unsupported component types as deep-equal raw JSON', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const exported = convertFormBuilderToFlowJSON(screens);
    const formChildren = exported.screens[0].layout.children[0].children;

    const original = fixtureFlowJSON.screens[0].layout.children[0].children;
    const unsupportedTypes = ['CalendarPicker', 'ChipsSelector', 'EmbeddedLink', 'RichText', 'If', 'Switch', 'PhotoPicker', 'DocumentPicker'];

    unsupportedTypes.forEach((typeName) => {
      const origComponent = original.find((c) => c.type === typeName);
      const exportedComponent = formChildren.find((c: any) => c.type === typeName);
      expect(exportedComponent).toEqual(origComponent);
    });
  });

  test('does not mutate original raw component objects during round-trip', () => {
    const inputCopy = JSON.parse(JSON.stringify(fixtureFlowJSON));
    const screens = convertFlowJSONToFormBuilder(inputCopy);
    convertFormBuilderToFlowJSON(screens);
    expect(inputCopy).toEqual(fixtureFlowJSON);
  });
});

describe('Known component round-trip', () => {
  test('preserves known TextHeading through round-trip', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const exported = convertFormBuilderToFlowJSON(screens);
    const formChildren = exported.screens[0].layout.children[0].children;
    const heading = formChildren.find((c: any) => c.type === 'TextHeading');
    expect(heading).toBeDefined();
    expect(heading.text).toBe('Welcome');
  });

  test('preserves known TextInput through round-trip', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const exported = convertFormBuilderToFlowJSON(screens);
    const formChildren = exported.screens[0].layout.children[0].children;
    const input = formChildren.find((c: any) => c.type === 'TextInput');
    expect(input).toBeDefined();
    expect(input.label).toBe('Name');
    expect(input.required).toBe(true);
  });
});

describe('computeFieldNames', () => {
  test('tracks unsupported components that have a name property', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const fieldNames = computeFieldNames(screens);
    const values = Array.from(fieldNames.values());
    expect(values).toContain('cal_pick');
    expect(values).toContain('chips_sel');
    expect(values).toContain('photo_pick');
    expect(values).toContain('doc_pick');
  });
});

describe('hasContentItemError', () => {
  test('returns false for Unsupported type items (no false errors)', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const unsupported = screens[0].content.filter((item) => item.type === 'Unsupported');
    unsupported.forEach((item) => {
      expect(hasContentItemError(item)).toBe(false);
    });
  });
});

describe('validateFlowJson', () => {
  test('validates flow JSON containing new component types without errors', () => {
    const result = validateFlowJson(fixtureFlowJSON);
    expect(result.errors).toHaveLength(0);
  });

  test('detects duplicate component names across new input types', () => {
    const duplicate = JSON.parse(JSON.stringify(fixtureFlowJSON));
    // Add a second CalendarPicker with same name on screen 2
    duplicate.screens[1].layout.children[0].children.splice(0, 0, {
      type: 'CalendarPicker', name: 'cal_pick', label: 'Dup',
    });
    const result = validateFlowJson(duplicate);
    const dupError = result.errors.find((e: any) => e.message.includes("Duplicate component name 'cal_pick'"));
    expect(dupError).toBeDefined();
  });
});

describe('Edge cases', () => {
  test('uses flowId for imported screens and generates IDs for new screens', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    // Add a new screen without flowId
    screens.push({
      id: '3',
      name: 'New Screen',
      order: 2,
      content: [],
      buttonLabel: 'Continue',
      // no flowId — should get generated ID
    });
    const exported = convertFormBuilderToFlowJSON(screens);
    expect(exported.screens[0].id).toBe('my_custom_screen');
    expect(exported.screens[1].id).toBe('final_screen');
    expect(exported.screens[2].id).toBe('new_screen');
  });

  test('handles empty flow JSON gracefully', () => {
    const screens = convertFlowJSONToFormBuilder({});
    expect(screens).toEqual([]);
  });

  test('preserves flowId and flowData on the imported Screen objects', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    expect(screens[0].flowId).toBe('my_custom_screen');
    expect(screens[0].flowData).toEqual({ custom_prop: { type: 'string', __example__: 'hello' } });
    expect(screens[1].flowId).toBe('final_screen');
  });

  test('does not share references between flowData and original', () => {
    const input = JSON.parse(JSON.stringify(fixtureFlowJSON));
    const screens = convertFlowJSONToFormBuilder(input);
    screens[0].flowData!.custom_prop.__example__ = 'modified';
    expect(input.screens[0].data.custom_prop.__example__).toBe('hello');
  });
});
