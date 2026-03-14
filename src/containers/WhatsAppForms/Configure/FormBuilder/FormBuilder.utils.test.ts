import { describe, expect, it } from 'vitest';

import {
  computeFieldNames,
  convertFlowJSONToFormBuilder,
  convertFormBuilderToFlowJSON,
  convertScreenToFlowJSON,
  hasContentItemError,
  hasFormErrors,
  hasScreenError,
  sanitizeName,
  validateFlowJson,
} from './FormBuilder.utils';

/**
 * Fixture: A WhatsApp Flow JSON with two screens containing all 8 new component types,
 * custom screen IDs, screen.data declarations, and a Footer with a dynamic expression.
 */
const fixtureFlowJSON = {
  version: '7.3',
  screens: [
    {
      id: 'screen_one',
      title: 'First Screen',
      terminal: false,
      data: {
        custom_field: {
          type: 'string',
          __example__: 'hello',
        },
        nested_obj: {
          type: 'object',
          __example__: { key: 'value' },
          properties: {
            key: { type: 'string' },
          },
        },
      },
      layout: {
        type: 'SingleColumnLayout',
        children: [
          {
            type: 'Form',
            name: 'flow_path',
            children: [
              {
                type: 'TextHeading',
                text: 'Welcome',
              },
              {
                type: 'CalendarPicker',
                name: 'cal_date',
                label: 'Pick a date',
                'min-date': '1704067200000',
                'max-date': '1735689600000',
              },
              {
                type: 'ChipsSelector',
                name: 'chips_value',
                label: 'Pick tags',
                'data-source': [
                  { id: '1', title: 'Tag A' },
                  { id: '2', title: 'Tag B' },
                ],
                'max-selected-items': 3,
              },
              {
                type: 'EmbeddedLink',
                text: 'Read our [Terms](https://example.com)',
              },
              {
                type: 'RichText',
                text: ['**Bold text**', 'Normal text'],
              },
              {
                type: 'Footer',
                label: '${data.some_value}',
                'on-click-action': {
                  name: 'navigate',
                  next: { type: 'screen', name: 'screen_two' },
                  payload: {},
                },
              },
            ],
          },
        ],
      },
    },
    {
      id: 'screen_two',
      title: 'Second Screen',
      terminal: true,
      data: {
        cal_date: {
          type: 'string',
          __example__: '2024-01-15',
        },
        chips_value: {
          type: 'array',
          items: { type: 'string' },
          __example__: ['Tag A'],
        },
      },
      layout: {
        type: 'SingleColumnLayout',
        children: [
          {
            type: 'Form',
            name: 'flow_path',
            children: [
              {
                type: 'If',
                condition: '${data.cal_date}',
                then: [
                  {
                    type: 'TextBody',
                    text: 'You picked a date',
                  },
                ],
                else: [
                  {
                    type: 'TextBody',
                    text: 'No date selected',
                  },
                ],
              },
              {
                type: 'Switch',
                value: '${data.chips_value}',
                cases: {
                  tag_a: [{ type: 'TextBody', text: 'Case A' }],
                  tag_b: [{ type: 'TextBody', text: 'Case B' }],
                },
              },
              {
                type: 'PhotoPicker',
                name: 'photo_upload',
                label: 'Upload a photo',
                'min-uploaded-photos': 1,
                'max-uploaded-photos': 3,
              },
              {
                type: 'DocumentPicker',
                name: 'doc_upload',
                label: 'Upload a document',
                'min-uploaded-documents': 1,
                'max-uploaded-documents': 1,
              },
              {
                type: 'TextInput',
                name: 'user_name',
                label: 'Your Name',
                'input-type': 'text',
                required: true,
              },
              {
                type: 'Footer',
                label: 'Submit',
                'on-click-action': {
                  name: 'complete',
                  payload: {},
                },
              },
            ],
          },
        ],
      },
    },
  ],
};

describe('FormBuilder.utils — round-trip preservation', () => {
  it('preserves screen IDs through import→export', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const output = convertFormBuilderToFlowJSON(screens);

    expect(output.screens[0].id).toBe('screen_one');
    expect(output.screens[1].id).toBe('screen_two');
  });

  it('preserves screen.data declarations through import→export', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const output = convertFormBuilderToFlowJSON(screens);

    // Screen 1 data preserved
    expect(output.screens[0].data.custom_field).toEqual({
      type: 'string',
      __example__: 'hello',
    });
    expect(output.screens[0].data.nested_obj).toEqual({
      type: 'object',
      __example__: { key: 'value' },
      properties: { key: { type: 'string' } },
    });

    // Screen 2 data preserved
    expect(output.screens[1].data.cal_date).toEqual({
      type: 'string',
      __example__: '2024-01-15',
    });
    expect(output.screens[1].data.chips_value).toEqual({
      type: 'array',
      items: { type: 'string' },
      __example__: ['Tag A'],
    });
  });

  it('preserves Footer label with dynamic expression exactly', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const output = convertFormBuilderToFlowJSON(screens);

    // Find Footer in screen_one
    const formChildren = output.screens[0].layout.children[0].children;
    const footer = formChildren.find((c: any) => c.type === 'Footer');
    expect(footer.label).toBe('${data.some_value}');
  });

  it('stores the Footer label on the screen.buttonLabel without alteration', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    expect(screens[0].buttonLabel).toBe('${data.some_value}');
    expect(screens[1].buttonLabel).toBe('Submit');
  });
});

describe('FormBuilder.utils — unsupported component round-trip', () => {
  it('imports CalendarPicker as Unsupported with raw JSON', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const calItem = screens[0].content.find((item) => item.name === 'CalendarPicker');
    expect(calItem).toBeDefined();
    expect(calItem!.type).toBe('Unsupported');
    expect(calItem!.data.rawComponent).toEqual(
      fixtureFlowJSON.screens[0].layout.children[0].children[1]
    );
  });

  it('imports ChipsSelector as Unsupported with raw JSON', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const chipsItem = screens[0].content.find((item) => item.name === 'ChipsSelector');
    expect(chipsItem).toBeDefined();
    expect(chipsItem!.type).toBe('Unsupported');
    expect(chipsItem!.data.rawComponent.type).toBe('ChipsSelector');
  });

  it('imports EmbeddedLink as Unsupported', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const linkItem = screens[0].content.find((item) => item.name === 'EmbeddedLink');
    expect(linkItem).toBeDefined();
    expect(linkItem!.type).toBe('Unsupported');
  });

  it('imports RichText as Unsupported', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const richItem = screens[0].content.find((item) => item.name === 'RichText');
    expect(richItem).toBeDefined();
    expect(richItem!.type).toBe('Unsupported');
  });

  it('imports If with nested children as Unsupported (preserves structure)', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const ifItem = screens[1].content.find((item) => item.name === 'If');
    expect(ifItem).toBeDefined();
    expect(ifItem!.type).toBe('Unsupported');
    expect(ifItem!.data.rawComponent.then).toHaveLength(1);
    expect(ifItem!.data.rawComponent.else).toHaveLength(1);
  });

  it('imports Switch with nested children as Unsupported (preserves structure)', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const switchItem = screens[1].content.find((item) => item.name === 'Switch');
    expect(switchItem).toBeDefined();
    expect(switchItem!.type).toBe('Unsupported');
    expect(switchItem!.data.rawComponent.cases).toEqual({
      tag_a: [{ type: 'TextBody', text: 'Case A' }],
      tag_b: [{ type: 'TextBody', text: 'Case B' }],
    });
  });

  it('imports PhotoPicker as Unsupported with raw JSON', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const photoItem = screens[1].content.find((item) => item.name === 'PhotoPicker');
    expect(photoItem).toBeDefined();
    expect(photoItem!.type).toBe('Unsupported');
    expect(photoItem!.data.rawComponent.type).toBe('PhotoPicker');
  });

  it('imports DocumentPicker as Unsupported with raw JSON', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const docItem = screens[1].content.find((item) => item.name === 'DocumentPicker');
    expect(docItem).toBeDefined();
    expect(docItem!.type).toBe('Unsupported');
    expect(docItem!.data.rawComponent.type).toBe('DocumentPicker');
  });

  it('re-exports all 8 unsupported component types as deep-equal raw JSON', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const output = convertFormBuilderToFlowJSON(screens);

    const screen1Components = output.screens[0].layout.children[0].children;
    const screen2Components = output.screens[1].layout.children[0].children;

    const origScreen1 = fixtureFlowJSON.screens[0].layout.children[0].children;
    const origScreen2 = fixtureFlowJSON.screens[1].layout.children[0].children;

    // CalendarPicker
    const calOut = screen1Components.find((c: any) => c.type === 'CalendarPicker');
    expect(calOut).toEqual(origScreen1[1]);

    // ChipsSelector
    const chipsOut = screen1Components.find((c: any) => c.type === 'ChipsSelector');
    expect(chipsOut).toEqual(origScreen1[2]);

    // EmbeddedLink
    const linkOut = screen1Components.find((c: any) => c.type === 'EmbeddedLink');
    expect(linkOut).toEqual(origScreen1[3]);

    // RichText
    const richOut = screen1Components.find((c: any) => c.type === 'RichText');
    expect(richOut).toEqual(origScreen1[4]);

    // If
    const ifOut = screen2Components.find((c: any) => c.type === 'If');
    expect(ifOut).toEqual(origScreen2[0]);

    // Switch
    const switchOut = screen2Components.find((c: any) => c.type === 'Switch');
    expect(switchOut).toEqual(origScreen2[1]);

    // PhotoPicker
    const photoOut = screen2Components.find((c: any) => c.type === 'PhotoPicker');
    expect(photoOut).toEqual(origScreen2[2]);

    // DocumentPicker
    const docOut = screen2Components.find((c: any) => c.type === 'DocumentPicker');
    expect(docOut).toEqual(origScreen2[3]);
  });

  it('does not mutate original raw component objects during round-trip', () => {
    const deepCopy = JSON.parse(JSON.stringify(fixtureFlowJSON));
    const screens = convertFlowJSONToFormBuilder(deepCopy);
    convertFormBuilderToFlowJSON(screens);

    // Verify the fixture was not mutated
    expect(deepCopy).toEqual(fixtureFlowJSON);
  });
});

describe('FormBuilder.utils — known component round-trip', () => {
  it('preserves known TextHeading through round-trip', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const output = convertFormBuilderToFlowJSON(screens);
    const heading = output.screens[0].layout.children[0].children.find(
      (c: any) => c.type === 'TextHeading'
    );
    expect(heading).toBeDefined();
    expect(heading.text).toBe('Welcome');
  });

  it('preserves known TextInput through round-trip', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const output = convertFormBuilderToFlowJSON(screens);
    const textInput = output.screens[1].layout.children[0].children.find(
      (c: any) => c.type === 'TextInput'
    );
    expect(textInput).toBeDefined();
    expect(textInput.label).toBe('Your Name');
    expect(textInput['input-type']).toBe('text');
    expect(textInput.required).toBe(true);
  });
});

describe('FormBuilder.utils — computeFieldNames with unsupported components', () => {
  it('tracks unsupported components that have a name property', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    const fieldNames = computeFieldNames(screens);

    // CalendarPicker has name "cal_date"
    const calItem = screens[0].content.find((item) => item.name === 'CalendarPicker');
    expect(calItem).toBeDefined();
    expect(fieldNames.get(calItem!.id)).toBe('cal_date');

    // ChipsSelector has name "chips_value"
    const chipsItem = screens[0].content.find((item) => item.name === 'ChipsSelector');
    expect(chipsItem).toBeDefined();
    expect(fieldNames.get(chipsItem!.id)).toBe('chips_value');
  });
});

describe('FormBuilder.utils — hasContentItemError with unsupported', () => {
  it('returns false for Unsupported type items (no false errors)', () => {
    const unsupportedItem = {
      id: 'test_1',
      name: 'CalendarPicker',
      type: 'Unsupported',
      order: 0,
      data: {
        rawComponent: { type: 'CalendarPicker', name: 'cal', label: 'Pick date' },
      },
    };
    expect(hasContentItemError(unsupportedItem)).toBe(false);
  });
});

describe('FormBuilder.utils — validateFlowJson with new component types', () => {
  it('validates flow JSON containing new component types without errors', () => {
    const result = validateFlowJson(fixtureFlowJSON);
    // Filter out navigation-related errors that may happen due to fixture simplicity
    const componentErrors = result.errors.filter(
      (e) => !e.message.includes('navigate') && !e.message.includes('terminal')
    );
    expect(componentErrors).toHaveLength(0);
  });

  it('detects duplicate component names across new input types', () => {
    const flow = JSON.parse(JSON.stringify(fixtureFlowJSON));
    // Add a duplicate name
    flow.screens[1].layout.children[0].children.push({
      type: 'CalendarPicker',
      name: 'cal_date', // Same as screen_one's CalendarPicker
      label: 'Duplicate',
    });
    const result = validateFlowJson(flow);
    const duplicateErrors = result.errors.filter((e) => e.message.includes('Duplicate'));
    expect(duplicateErrors.length).toBeGreaterThan(0);
  });
});

describe('FormBuilder.utils — screen ID generation for mixed screens', () => {
  it('uses flowId for imported screens and generates IDs for new screens', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);

    // Add a new screen (simulating user adding in builder)
    screens.push({
      id: '3',
      name: 'New Screen',
      order: 2,
      content: [],
      buttonLabel: 'Done',
    });

    const output = convertFormBuilderToFlowJSON(screens);
    expect(output.screens[0].id).toBe('screen_one');
    expect(output.screens[1].id).toBe('screen_two');
    expect(output.screens[2].id).toBe('new_screen'); // generated from name
  });
});

describe('FormBuilder.utils — edge cases', () => {
  it('handles empty flow JSON gracefully', () => {
    expect(convertFlowJSONToFormBuilder(null)).toEqual([]);
    expect(convertFlowJSONToFormBuilder({})).toEqual([]);
    expect(convertFlowJSONToFormBuilder({ screens: 'invalid' })).toEqual([]);
  });

  it('preserves flowId and flowData on the imported Screen objects', () => {
    const screens = convertFlowJSONToFormBuilder(fixtureFlowJSON);
    expect(screens[0].flowId).toBe('screen_one');
    expect(screens[0].flowData).toEqual(fixtureFlowJSON.screens[0].data);
    expect(screens[1].flowId).toBe('screen_two');
    expect(screens[1].flowData).toEqual(fixtureFlowJSON.screens[1].data);
  });

  it('does not share references between flowData and original', () => {
    const copy = JSON.parse(JSON.stringify(fixtureFlowJSON));
    const screens = convertFlowJSONToFormBuilder(copy);
    // Mutate the copied original — should not affect imported flowData
    copy.screens[0].data.custom_field.__example__ = 'CHANGED';
    expect(screens[0].flowData!.custom_field.__example__).toBe('hello');
  });
});
