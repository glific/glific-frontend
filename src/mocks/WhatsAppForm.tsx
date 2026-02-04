import {
  CREATE_FORM,
  PUBLISH_FORM,
  DEACTIVATE_FORM,
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

export const publishWhatsappFormError = {
  request: {
    query: PUBLISH_FORM,
    variables: {
      id: '3',
    },
  },
  error: new Error('Failed to publish'),
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
                '{"version":"7.3","screens":[{"title":"Screen 1","terminal":true,"layout":{"type":"SingleColumnLayout","children":[{"type":"Form","name":"flow_path","children":[{"type":"TextHeading","text":"Text"},{"type":"TextInput","required":false,"name":"screen_0_Label_0","label":"Label","input-type":"text"},{"type":"Footer","on-click-action":{"payload":{"screen_0_Label_0":"${form.screen_0_Label_0}"},"name":"complete"},"label":"Continue"}]}]},"id":"screen_one","data":{}}]}',
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

const revertWhatsappFormRevisionMock = {
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
