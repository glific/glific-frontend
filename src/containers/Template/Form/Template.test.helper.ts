import { getOrganizationLanguagesQueryByOrder } from 'mocks/Organization';
import { getFilterTagQuery } from 'mocks/Tag';
import { templateEditMock } from 'mocks/Template';

export const templateFormHSMFormFields = [
  {
    name: 'example',
    label: 'Sample message*',
    rows: 5,
    convertToWhatsApp: true,
    textArea: true,
    disabled: true,
    helperText:
      'Replace variables eg. {{1}} with actual values enclosed in [ ] eg. [12345] to show a complete message with meaningful word/statement/numbers/ special characters.',
    isEditing: true,
    editorState: '',
  },
  {
    name: 'category',
    options: [
      {
        label: 'UTILITY',
        id: 0,
      },
      {
        label: 'MARKETING',
        id: 1,
      },
    ],
    optionLabel: 'label',
    multiple: false,
    label: 'Category*',
    placeholder: 'Category*',
    disabled: true,
    helperText: 'Select the most relevant category',
  },
  {
    name: 'shortcode',
    placeholder: 'Element name*',
    label: 'Element name*',
    disabled: true,
    inputProp: {},
  },
];

export const HSM_TEMPLATE_MOCKS = [
  templateEditMock('1', {
    buttonType: 'QUICK_REPLY',
    buttons:
      '[{"type":"QUICK_REPLY","text":"View Account Balance"},{"type":"QUICK_REPLY","text":"View Mini Statement"}]',
  }),
  getFilterTagQuery,
  getOrganizationLanguagesQueryByOrder,
  templateEditMock('1', {
    buttonType: 'QUICK_REPLY',
    buttons:
      '[{"type":"QUICK_REPLY","text":"View Account Balance"},{"type":"QUICK_REPLY","text":"View Mini Statement"}]',
  }),
  templateEditMock('2', {
    buttonType: 'CALL_TO_ACTION',
    buttons:
      '[{"type":"CALL_TO_ACTION","text":"View Account Balance"},{"type":"QUICK_REPLY","text":"View Mini Statement"}]',
  }),
  templateEditMock('2', {
    buttonType: 'CALL_TO_ACTION',
    buttons:
      '[{"type":"CALL_TO_ACTION","text":"View Account Balance"},{"type":"QUICK_REPLY","text":"View Mini Statement"}]',
  }),
];
