import {
  CREATE_FORM,
  PUBLISH_FORM,
  DEACTIVATE_FORM,
  ACTIVATE_FORM,
  SYNC_FORM,
  UPDATE_FORM,
  SAVE_WHATSAPP_FORM_REVISION,
  REVERT_TO_WHATSAPP_FORM_REVISION,
} from 'graphql/mutations/WhatsAppForm';
import {
  GET_WHATSAPP_FORM,
  LIST_FORM_CATEGORIES,
  LIST_WHATSAPP_FORMS,
  COUNT_WHATSAPP_FORMS,
  GET_WHATSAPP_FORM_DEFINITIONS,
  GET_LATEST_WHATSAPP_FORM_REVISION,
  LIST_WHATSAPP_FORM_REVISIONS,
} from 'graphql/queries/WhatsAppForm';

export const validScreen = (overrides: Record<string, any> = {}) => ({
  id: 'screen_one',
  title: 'Screen 1',
  terminal: true,
  data: {},
  layout: {
    type: 'SingleColumnLayout',
    children: [
      {
        type: 'Form',
        name: 'flow_path',
        children: [
          { type: 'TextInput', name: 'field_name', label: 'Field Name', required: true, 'input-type': 'text' },
          {
            type: 'Footer',
            label: 'Continue',
            'on-click-action': { name: 'complete', payload: { field_name: '${form.field_name}' } },
          },
        ],
      },
    ],
  },
  ...overrides,
});

export const formJson = {
  version: '7.2',
  screens: [
    {
      id: 'RECOMMEND',
      title: 'Feedback 1 of 2',
      data: {},
      layout: {},
    },
    {
      id: 'RATE',
      title: 'Feedback 2 of 2',
      data: {},
      terminal: true,
      success: true,
      layout: {
        children: [
          {
            children: {
              label: 'Done',
              'on-click-action': {
                name: 'complete',
                payload: {
                  screen_1_Purchase_0: '${form.Purchase_experience}',
                  screen_1_Delivery_and_1: '${form.Delivery_and_setup}',
                  screen_1_Customer_2: '${form.Customer_service}',
                  screen_0_Choose_0: '${data.screen_0_Choose_0}',
                  screen_0_Leave_a_1: '${data.screen_0_Leave_a_1}',
                },
              },
              type: 'Footer',
            },
          },
        ],
      },
    },
  ],
};

const formDefinition = {
  version: '7.3',
  screens: [
    {
      id: 'screen_one',
      title: 'Screen 1',
      terminal: true,
      data: {},
      layout: {
        type: 'SingleColumnLayout',
        children: [
          {
            type: 'Form',
            name: 'flow_path',
            children: [
              {
                label: 'Continue',
                'on-click-action': {
                  name: 'complete',
                  payload: {},
                },
                type: 'Footer',
              },
            ],
          },
        ],
      },
    },
  ],
};

const whatsappFormCategories = {
  request: {
    query: LIST_FORM_CATEGORIES,
    variables: {},
  },
  result: {
    data: {
      whatsappFormCategories: [
        'sign_up',
        'sign_in',
        'appointment_booking',
        'lead_generation',
        'contact_us',
        'customer_support',
        'survey',
        'other',
      ],
    },
  },
};

const syncWhatsappForm = {
  request: {
    query: SYNC_FORM,
  },
  result: {
    data: {
      syncWhatsappForm: {
        message: 'WhatsApp Forms synced successfully',
        errors: null,
      },
    },
  },
};

const createWhatsAppFormQuery = {
  request: {
    query: CREATE_FORM,
    variables: {
      input: {
        name: 'Test Form',
        description: 'This is a test form',
        categories: ['other'],
        googleSheetUrl: '',
      },
    },
  },
  result: {
    data: {
      createWhatsappForm: {
        whatsappForm: {
          id: '1',
          name: 'Test Form',
        },
        errors: null,
      },
    },
  },
};

const createWhatsAppFormQueryWithErrors = {
  request: {
    query: CREATE_FORM,
    variables: {
      input: {
        name: 'Test Form2',
        description: 'This is a test form',
        categories: ['other'],
        googleSheetUrl: '',
      },
    },
  },
  result: {
    data: {
      createWhatsappForm: null,
    },
    errors: [
      {
        message:
          'Flow name should be unique within one WhatsApp Business Account. Please select another name for your Flow.',
        status: 'error',
        path: ['createWhatsappForm'],
        locations: [
          {
            line: 2,
            column: 3,
          },
        ],
      },
    ],
  },
};

export const publishWhatsappForm = (id: string) => ({
  request: {
    query: PUBLISH_FORM,
    variables: {
      id,
    },
  },
  result: {
    data: {
      publishWhatsappForm: {
        whatsappForm: {
          id,
          status: 'PUBLISHED',
        },
        errors: null,
      },
    },
  },
});

export const deactivateWhatsappForm = {
  request: {
    query: DEACTIVATE_FORM,
    variables: {
      id: '2',
    },
  },
  result: {
    data: {
      deactivateWhatsappForm: {
        whatsappForm: { id: '2', status: 'inactive', __typename: 'WhatsappForm' },
        errors: null,
      },
    },
  },
};

export const activateWhatsappForm = {
  request: {
    query: ACTIVATE_FORM,
    variables: {
      activateWhatsappFormId: '1',
    },
  },
  result: {
    data: {
      activateWhatsappForm: {
        whatsappForm: { id: '1', status: 'PUBLISHED', __typename: 'WhatsappForm' },
        errors: null,
      },
    },
  },
};

export const activateWhatsappFormError = {
  request: {
    query: ACTIVATE_FORM,
    variables: {
      activateWhatsappFormId: '1',
    },
  },
  error: new Error('Failed to activate'),
};

export const activateWhatsappFormPayloadError = {
  request: {
    query: ACTIVATE_FORM,
    variables: {
      activateWhatsappFormId: '1',
    },
  },
  result: {
    data: {
      activateWhatsappForm: {
        whatsappForm: null,
        errors: [{ message: 'Form could not be activated' }],
      },
    },
  },
};

export const publishWhatsappFormError = {
  request: {
    query: PUBLISH_FORM,
    variables: {
      id: '3',
    },
  },
  error: new Error('Failed to publish'),
};

export const publishWhatsappFormErrorId1 = {
  request: {
    query: PUBLISH_FORM,
    variables: {
      id: '1',
    },
  },
  error: new Error('Failed to publish'),
};

export const publishWhatsappFormPayloadErrorId1 = {
  request: {
    query: PUBLISH_FORM,
    variables: {
      id: '1',
    },
  },
  result: {
    data: {
      publishWhatsappForm: {
        whatsappForm: null,
        errors: [{ message: 'Form could not be published' }],
      },
    },
  },
};

export const deactivateWhatsappFormError = {
  request: {
    query: DEACTIVATE_FORM,
    variables: {
      id: '2',
    },
  },
  error: new Error('Failed to deactivate'),
};

const listAllWatsappForms = {
  request: {
    query: LIST_WHATSAPP_FORMS,
    variables: {
      filter: {},
      opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'name' },
    },
  },
  result: {
    data: {
      whatsappForms: [
        {
          id: '1',
          name: 'This is form name 1',
          status: 'INACTIVE',
          description: 'This is test form',
          metaFlowId: '1473834353902269',
          categories: ['customer_support'],
          revision: {
            id: '1',
            definition: JSON.stringify(formJson),
          },
          sheet: {
            id: 123,
            label: 'Test Sheet',
            url: 'http://example.com/sheet',
            isActive: true,
            sheetDataCount: 50,
          },
          updatedAt: '2026-02-03 08:22:40.815596Z',
        },
        {
          id: '2',
          name: 'This is form name 2',
          status: 'PUBLISHED',
          description: 'This is test form',
          metaFlowId: '1473834353902269',
          categories: ['customer_support'],
          revision: {
            id: '1',
            definition: JSON.stringify(formJson),
          },
          sheet: null,
          updatedAt: '2026-02-03 08:22:40.815596Z',
        },
        {
          id: '3',
          name: 'This is form name 3',
          status: 'DRAFT',
          description: 'This is test form',
          metaFlowId: '1473834353902269',
          categories: ['customer_support'],
          revision: {
            id: '1',
            definition: JSON.stringify(formJson),
          },
          sheet: null,
          updatedAt: '2026-02-03 08:22:40.815596Z',
        },
      ],
    },
  },
};

const listWhatsappForms = (status: string) => {
  let filter = {};
  if (status) {
    filter = { status };
  } else {
    return listAllWatsappForms;
  }

  return {
    request: {
      query: LIST_WHATSAPP_FORMS,
      variables: {
        filter,
        opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'name' },
      },
    },
    result: {
      data: {
        whatsappForms: [
          {
            id: '1',
            name: 'This is form name',
            status,
            description: 'This is test form',
            metaFlowId: '1473834353902269',
            categories: ['customer_support'],
            revision: {
              id: '1',
              definition: JSON.stringify(formJson),
            },
            sheet: {
              id: 123,
              label: 'Test Sheet',
              url: 'http://example.com/sheet',
              isActive: true,
              sheetDataCount: 50,
            },
            updatedAt: '2026-02-03 08:22:40.815596Z',
          },
        ],
      },
    },
  };
};

const countWhatsappForms = (status: string = '', count: number = 1) => {
  let filter = {};
  if (status) filter = { status };
  return {
    request: {
      query: COUNT_WHATSAPP_FORMS,
      variables: {
        filter,
      },
    },
    result: {
      data: {
        countWhatsappForms: count,
      },
    },
  };
};

const getWhatsAppForm = {
  request: {
    query: GET_WHATSAPP_FORM,
    variables: {
      id: '1',
    },
  },
  result: {
    data: {
      whatsappForm: {
        whatsappForm: {
          categories: ['customer_support'],
          revision: {
            id: '1',
            definition: JSON.stringify(formJson),
          },
          description: 'This is test form',
          id: '1',
          metaFlowId: '1473834353902269',
          name: 'This is form name',
          status: 'DRAFT',
          sheet: {
            id: 123,
            label: 'Test Sheet',
            url: 'http://example.com/sheet',
            isActive: true,
            sheetDataCount: 50,
          },
        },
      },
    },
  },
};

const syncWhatsappFormQueryWithErrors = {
  request: {
    query: SYNC_FORM,
  },
  result: {
    data: {
      syncWhatsappForm: {
        whatsappForm: null,
        errors: [
          {
            message: 'Something went wrong',
          },
        ],
      },
    },
  },
};

const updateWhatsappForm = {
  request: {
    query: UPDATE_FORM,
    variables: {
      id: '1',
      input: {
        name: 'This is form name',
        description: 'This is an updated test form',
        categories: ['customer_support'],
        googleSheetUrl: 'http://example.com/sheet',
      },
    },
  },
  result: {
    data: {
      updateWhatsappForm: {
        whatsappForm: {
          id: '1',
          name: 'This is form name',

          __typename: 'WhatsappForm',
        },
        errors: null,
        __typename: 'UpdateWhatsappFormPayload',
      },
    },
  },
};

const createWhatsappFormDuplicateNameErrorMock = {
  request: {
    query: CREATE_FORM,
    variables: {
      input: {
        name: 'Test Form2',
        description: 'This is a test form',
        categories: ['other'],
        googleSheetUrl: JSON.stringify(formJson),
      },
    },
  },
  result: {
    errors: [
      {
        message:
          'Flow name should be unique within one WhatsApp Business Account. Please select another name for your Flow.',
        path: ['createWhatsappForm'],
      },
    ],
  },
};

export const listWhatsappFormsForHsmInvalidDef = {
  request: {
    query: GET_WHATSAPP_FORM_DEFINITIONS,
    variables: {
      filter: { status: 'PUBLISHED' },
    },
  },
  result: {
    data: {
      listWhatsappForms: [
        {
          name: 'This is form name',
          metaFlowId: '1473834353902269',
          revision: {
            id: '1',
            definition: 'invalid json',
          },
        },
      ],
    },
  },
};

const listWhatsappFormsForHsm = {
  request: {
    query: GET_WHATSAPP_FORM_DEFINITIONS,
    variables: {
      filter: { status: 'PUBLISHED' },
    },
  },
  result: {
    data: {
      listWhatsappForms: [
        {
          name: 'This is form name',
          metaFlowId: '1473834353902269',
          revision: {
            id: '1',
            definition: JSON.stringify(formJson),
          },
        },
      ],
    },
  },
};

export const saveWhatsappFormRevisionMock = {
  request: {
    query: SAVE_WHATSAPP_FORM_REVISION,
    variables: {
      input: {
        whatsappFormId: '1',
        definition: JSON.stringify(formDefinition),
      },
    },
  },
  result: {
    data: {
      saveWhatsappFormRevision: {
        whatsappFormRevision: {
          id: '10',
          revisionNumber: 2,
        },
      },
    },
  },
};

const latestRevisionMock = (id: string) => {
  return {
    request: {
      query: GET_LATEST_WHATSAPP_FORM_REVISION,
      variables: { id },
    },
    result: {
      data: {
        whatsappForm: {
          __typename: 'WhatsappFormResult',
          whatsappForm: {
            __typename: 'WhatsappForm',
            name: 'Whatsapp Form',
            revision: {
              __typename: 'WhatsappFormRevision',
              definition:
                '{"screens": [{"id": "screen", "data": {}, "title": "Screen 1", "layout": {"type": "SingleColumnLayout", "children": [{"name": "flow_path", "type": "Form", "children": [{"text": "Text", "type": "TextHeading"}, {"name": "screen_0_label_0", "type": "TextInput", "label": "Label", "required": false, "input-type": "text"}, {"name": "field_name", "type": "RadioButtonsGroup", "label": "Field Name", "required": true, "data-source": [{"id": "Option_1", "title": "Option 1"}, {"id": "Option_2", "title": "Option 2"}]}, {"type": "Footer", "label": "Continue", "on-click-action": {"name": "complete", "payload": {"field_name": "${form.field_name}", "screen_0_label_0": "${form.screen_0_label_0}"}}}]}]}, "terminal": true}], "version": "7.3"}',
              id: '417',
            },
            status: id === '1' ? 'DRAFT' : 'PUBLISHED',
          },
        },
      },
    },
  };
};

const saveRevisionMock = {
  request: {
    query: SAVE_WHATSAPP_FORM_REVISION,
  },
  result: {
    data: {
      saveWhatsappFormRevision: {
        whatsappFormRevision: {
          id: 'rev-1',
          revisionNumber: 1,
        },
      },
    },
  },
  variableMatcher: () => true,
};

const listRevisions = {
  request: {
    query: LIST_WHATSAPP_FORM_REVISIONS,
    variables: {
      whatsappFormId: '1',
      limit: 10,
    },
  },
  result: {
    data: {
      listWhatsappFormRevisions: [
        {
          definition:
            '{"version":"7.3","screens":[{"title":"Screen 1","terminal":true,"layout":{"type":"SingleColumnLayout","children":[{"type":"Form","name":"flow_path","children":[{"type":"TextHeading","text":"Text"},{"type":"OptIn","required":false,"name":"screen_0_Label_0","label":"Label"},{"type":"Dropdown","required":false,"name":"screen_0_Label_1","label":"Label","data-source":[{"title":"Option 1","id":"0_Option 1"},{"title":"Option 2","id":"1_Option 2"}]},{"type":"RadioButtonsGroup","required":false,"name":"screen_0_Label_2","label":"Label","data-source":[{"title":"Option 1","id":"0_Option 1"},{"title":"Option 2","id":"1_Option 2"}]},{"type":"Footer","on-click-action":{"payload":{"screen_0_Label_2":"${form.screen_0_Label_2}","screen_0_Label_1":"${form.screen_0_Label_1}","screen_0_Label_0":"${form.screen_0_Label_0}"},"name":"complete"},"label":"Continue"}]}]},"id":"screen_one","data":{}}]}',
          id: '20',
          isCurrent: true,
          revisionNumber: 20,
        },
        ...Array(9)
          .fill(null)
          .map((_, i) => ({
            definition:
              '{"version":"7.3","screens":[{"title":"Screen 1","terminal":true,"layout":{"type":"SingleColumnLayout","children":[{"type":"Form","name":"flow_path","children":[{"type":"TextHeading","text":"Text"},{"type":"OptIn","required":false,"name":"screen_0_Label_0","label":"Label"},{"type":"Dropdown","required":false,"name":"screen_0_Label_1","label":"Label","data-source":[{"title":"Option 1","id":"0_Option 1"},{"title":"Option 2","id":"1_Option 2"}]},{"type":"RadioButtonsGroup","required":false,"name":"screen_0_Label_2","label":"Label","data-source":[{"title":"Option 1","id":"0_Option 1"},{"title":"Option 2","id":"1_Option 2"}]},{"type":"Footer","on-click-action":{"payload":{"screen_0_Label_2":"${form.screen_0_Label_2}","screen_0_Label_1":"${form.screen_0_Label_1}","screen_0_Label_0":"${form.screen_0_Label_0}"},"name":"complete"},"label":"Continue"}]}]},"id":"screen_one","data":{}}]}',
            id: i,
            isCurrent: false,
            revisionNumber: i + 1,
          })),
      ],
    },
  },
};

export const revertWhatsappFormRevisionMock = {
  request: {
    query: REVERT_TO_WHATSAPP_FORM_REVISION,
    variables: { whatsappFormId: '1', revisionId: 4 },
  },
  result: {
    data: {
      revertToWhatsappFormRevision: {
        __typename: 'WhatsappFormRevisionResult',
        errors: null,
        whatsappFormRevision: {
          __typename: 'WhatsappFormRevision',
          definition:
            '{"version":"7.3","screens":[{"title":"Screen 1","terminal":true,"layout":{"type":"SingleColumnLayout","children":[{"type":"Form","name":"flow_path","children":[{"type":"TextHeading","text":"Text"},{"type":"TextInput","required":false,"name":"screen_0_Label_0","label":"Label","input-type":"text"},{"type":"TextHeading","text":"Text"},{"type":"RadioButtonsGroup","required":false,"name":"screen_0_Label_1","label":"Label","data-source":[{"title":"Option 1","id":"0_Option 1"},{"title":"Option 2","id":"1_Option 2"}]},{"type":"Dropdown","required":false,"name":"screen_0_Label_2","label":"Label","data-source":[{"title":"Option 1","id":"0_Option 1"},{"title":"Option 2","id":"1_Option 2"}]},{"type":"OptIn","required":false,"name":"screen_0_Label_3","label":"Label"},{"type":"Footer","on-click-action":{"payload":{"screen_0_Label_3":"${form.screen_0_Label_3}","screen_0_Label_2":"${form.screen_0_Label_2}","screen_0_Label_1":"${form.screen_0_Label_1}","screen_0_Label_0":"${form.screen_0_Label_0}"},"name":"complete"},"label":"Continue"}]}]},"id":"screen_one","data":{}}]}',
        },
      },
    },
  },
};

export const revertWhatsappFormRevisionErrorMock = {
  request: {
    query: REVERT_TO_WHATSAPP_FORM_REVISION,
    variables: { whatsappFormId: '1', revisionId: 4 },
  },
  error: new Error('Failed to revert to selected version'),
};

export const revertWhatsappFormRevisionPayloadErrorMock = {
  request: {
    query: REVERT_TO_WHATSAPP_FORM_REVISION,
    variables: { whatsappFormId: '1', revisionId: 4 },
  },
  result: {
    data: {
      revertToWhatsappFormRevision: {
        __typename: 'WhatsappFormRevisionResult',
        errors: [{ key: 'revision', message: 'Revision could not be reverted' }],
        whatsappFormRevision: null,
      },
    },
  },
};

export const WHATSAPP_FORM_MOCKS = [
  whatsappFormCategories,
  createWhatsAppFormQuery,
  getWhatsAppForm,
  listAllWatsappForms,
  listWhatsappForms(''),
  listWhatsappForms('DRAFT'),
  listWhatsappForms('INACTIVE'),
  listWhatsappForms('PUBLISHED'),
  countWhatsappForms(),
  countWhatsappForms('DRAFT'),
  countWhatsappForms('INACTIVE'),
  countWhatsappForms('PUBLISHED'),
  createWhatsAppFormQueryWithErrors,

  updateWhatsappForm,
  updateWhatsappForm,
  createWhatsappFormDuplicateNameErrorMock,
  listWhatsappFormsForHsm,

  latestRevisionMock('1'),
  latestRevisionMock('2'),
  saveRevisionMock,
  saveWhatsappFormRevisionMock,
  listRevisions,
  listRevisions,
  revertWhatsappFormRevisionMock,
  publishWhatsappForm('1'),
];

export { syncWhatsappFormQueryWithErrors, syncWhatsappForm };

/**
 * Every component the builder models, with every attribute Meta's reference page lists —
 * each has its own conversion branch and its own CONSUMED_ATTRIBUTE_KEYS entry, so each can
 * break independently.
 *
 * Passthrough components all share one code path (`rawComponent` returned verbatim), so only
 * three representatives are covered: PhotoPicker (an input), Switch (nested children) and
 * RichText (array-valued attribute). CalendarPicker, DocumentPicker, EmbeddedLink,
 * NavigationList and ChipsSelector have their own dedicated tests above.
 *
 * Source: plans/Components.md (Meta's Flow JSON component reference) + the media upload page.
 */
export const FLOW_JSON_COMPONENTS: Record<string, any> = {
  TextHeading: { type: 'TextHeading', text: 'Heading', visible: true },
  TextSubheading: { type: 'TextSubheading', text: 'Sub', visible: true },
  TextBody: {
    type: 'TextBody',
    text: 'Body',
    'font-weight': 'bold',
    strikethrough: false,
    visible: true,
    markdown: true,
  },
  TextCaption: {
    type: 'TextCaption',
    text: 'Cap',
    'font-weight': 'italic',
    strikethrough: true,
    visible: true,
    markdown: false,
  },
  RichText: { type: 'RichText', text: ['# H1', 'some **bold**'], visible: true },
  TextInput: {
    type: 'TextInput',
    label: 'Name',
    'input-type': 'text',
    pattern: '^[a-z]+$',
    required: true,
    'min-chars': 2,
    'max-chars': 40,
    'helper-text': 'Your name',
    name: 'full_name',
    visible: true,
    'init-value': 'abc',
    'error-message': 'Bad name',
  },
  TextArea: {
    type: 'TextArea',
    label: 'Notes',
    required: false,
    'max-length': 500,
    name: 'notes',
    'helper-text': 'Optional',
    enabled: true,
    visible: true,
    'init-value': 'hi',
    'error-message': 'Too long',
  },
  CheckboxGroup: {
    type: 'CheckboxGroup',
    name: 'toppings',
    label: 'Toppings',
    required: true,
    'data-source': [
      {
        id: '1',
        title: 'Cheese',
        description: 'Extra',
        metadata: 'meta',
        enabled: true,
        image: 'BASE64',
        'alt-text': 'cheese',
        color: '#ffffff',
      },
    ],
    'min-selected-items': 1,
    'max-selected-items': 3,
    enabled: true,
    visible: true,
    'on-select-action': { name: 'update_data', payload: {} },
    description: 'Pick some',
    'init-value': ['1'],
    'error-message': 'Pick one',
    'media-size': 'regular',
  },
  RadioButtonsGroup: {
    type: 'RadioButtonsGroup',
    name: 'size',
    label: 'Size',
    required: true,
    'data-source': [
      {
        id: '1',
        title: 'Small',
        description: 'S',
        metadata: 'm',
        enabled: true,
        image: 'BASE64',
        'alt-text': 'small',
        color: '#000000',
      },
    ],
    enabled: true,
    visible: true,
    'on-select-action': { name: 'update_data', payload: {} },
    description: 'Choose',
    'init-value': '1',
    'error-message': 'Required',
    'media-size': 'regular',
  },
  Dropdown: {
    type: 'Dropdown',
    label: 'City',
    name: 'city',
    'data-source': [
      {
        id: '1',
        title: 'Pune',
        description: 'MH',
        metadata: 'm',
        enabled: true,
        image: 'BASE64',
        'alt-text': 'pune',
      },
    ],
    required: true,
    enabled: true,
    visible: true,
    'on-select-action': { name: 'update_data', payload: {} },
    'init-value': '1',
    'error-message': 'Required',
  },
  DatePicker: {
    type: 'DatePicker',
    label: 'DOB',
    'min-date': '1900-01-01',
    'max-date': '2030-01-01',
    name: 'dob',
    'unavailable-dates': ['2025-01-01'],
    visible: true,
    'helper-text': 'Pick',
    enabled: true,
    'on-select-action': { name: 'update_data', payload: {} },
    'init-value': '2000-01-01',
    'error-message': 'Bad date',
  },
  OptIn: {
    type: 'OptIn',
    label: 'I agree',
    required: true,
    name: 'terms',
    'on-click-action': { name: 'navigate', next: { type: 'screen', name: 'x' }, payload: {} },
    visible: true,
    'init-value': false,
  },
  Image: {
    type: 'Image',
    src: 'QkFTRTY0',
    width: 200,
    height: 100,
    'scale-type': 'cover',
    'aspect-ratio': 1,
    'alt-text': 'pic',
  },
  PhotoPicker: {
    type: 'PhotoPicker',
    name: 'photos',
    label: 'Photos',
    description: 'up to 3',
    'photo-source': 'camera_gallery',
    'max-file-size-kb': 1024,
    'min-uploaded-photos': 1,
    'max-uploaded-photos': 3,
    enabled: true,
    visible: true,
    'error-message': 'req',
  },
  Switch: {
    type: 'Switch',
    value: '${data.status}',
    cases: { pending: [{ type: 'TextBody', text: 'p' }], done: [{ type: 'TextBody', text: 'd' }] },
  },
};

export const FOOTER_WITH_CAPTIONS = {
  type: 'Footer',
  label: 'Done',
  'left-caption': 'L',
  'right-caption': 'R',
  enabled: true,
  'on-click-action': { name: 'complete', payload: {} },
};
