import { CREATE_FORM, PUBLISH_FORM, DEACTIVATE_FORM } from 'graphql/mutations/WhatsAppForm';
import {
  GET_WHATSAPP_FORM,
  LIST_FORM_CATEGORIES,
  LIST_WHATSAPP_FORMS,
  COUNT_WHATSAPP_FORMS,
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

const createdWhatsAppFormQuery = {
  request: {
    query: CREATE_FORM,
    variables: {
      input: {
        name: 'Test Form',
        formJson: JSON.stringify(formJson),
        description: 'This is a test form',
        categories: ['other'],
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

const createdWhatsAppFormQueryWithErrors = {
  request: {
    query: CREATE_FORM,
    variables: {
      input: {
        name: 'Test Form2',
        formJson: JSON.stringify(formJson),
        description: 'This is a test form',
        categories: ['other'],
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

export const publishWhatsappForm = {
  request: {
    query: PUBLISH_FORM,
    variables: {
      id: '3',
    },
  },
  result: {
    data: {
      publishWhatsappForm: {
        id: '1',
        status: 'PUBLISHED',
      },
    },
  },
};

export const deactivateWhatsappForm = {
  request: {
    query: DEACTIVATE_FORM,
    variables: {
      id: '1',
    },
  },
  result: {
    data: {
      publishWhatsappForm: {
        id: '1',
        status: 'inactive',
        __typename: 'WhatsappForm',
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
      id: '1',
    },
  },
  error: new Error('Failed to publish'),
};

const listWhatsappFormsDraft = {
  request: {
    query: LIST_WHATSAPP_FORMS,
    variables: {
      filter: { status: 'DRAFT' },
      opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'name' },
    },
  },
  result: {
    data: {
      whatsappForms: [
        {
          id: '3',
          name: 'This is form name',
          status: 'DRAFT',
          description: 'This is test form',
          metaFlowId: '1473834353902269',
          categories: ['customer_support'],
          definition: JSON.stringify(formJson),
        },
      ],
    },
  },
};

const countWhatsappForms = {
  request: {
    query: COUNT_WHATSAPP_FORMS,
    variables: {
      filter: {},
    },
  },
  result: {
    data: {
      countWhatsappForms: 1,
    },
  },
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
          definition: JSON.stringify(formJson),
          description: 'This is test form',
          id: '1',
          insertedAt: '2025-11-06 09:31:19.955920Z',
          metaFlowId: '1473834353902269',
          name: 'This is form name',
          status: 'DRAFT',
          updatedAt: '2025-11-06 09:31:39.104993Z',
        },
      },
    },
  },
};

const listWhatsappFormsInitial = {
  request: {
    query: LIST_WHATSAPP_FORMS,
    variables: {
      filter: { status: 'PUBLISHED' },
      opts: {
        limit: 50,
        offset: 0,
        order: 'ASC',
        orderWith: 'name',
      },
    },
  },
  result: {
    data: {
      whatsappForms: [
        {
          id: '1',
          name: 'This is form name',
          status: 'PUBLISHED',
          description: 'This is test form',
          metaFlowId: '1473834353902269',
          categories: ['customer_support'],
          definition: JSON.stringify(formJson),
        },
      ],
    },
  },
};
const listWhatsappFormsWithThreePublishedwithfilter = {
  request: {
    query: LIST_WHATSAPP_FORMS,
    variables: {
      filter: { status: 'PUBLISHED' },
    },
  },
  result: {
    data: {
      listWhatsappForms: [
        {
          id: '1',
          name: 'This is form name',
          status: 'PUBLISHED',
          description: 'Customer support form',
          metaFlowId: 'meta-flow-1',
          categories: ['customer_support'],
          definition: JSON.stringify(formJson),
          __typename: 'WhatsappForm',
        },
        {
          id: '2',
          name: 'Feedback Form',
          status: 'PUBLISHED',
          description: 'Feedback collection form',
          metaFlowId: 'meta-flow-2',
          categories: ['survey'],
          definition: JSON.stringify(formJson),
          __typename: 'WhatsappForm',
        },
        {
          id: '3',
          name: 'Lead Generation Form',
          status: 'PUBLISHED',
          description: 'Lead generation form',
          metaFlowId: 'meta-flow-3',
          categories: ['lead_generation'],
          definition: JSON.stringify(formJson),
          __typename: 'WhatsappForm',
        },
      ],
    },
  },
};
const listWhatsappFormsWithoutStatus = {
  request: {
    query: LIST_WHATSAPP_FORMS,
    variables: {
      filter: {},
      opts: {
        limit: 50,
        offset: 0,
        order: 'ASC',
        orderWith: 'name',
      },
    },
  },
  result: {
    data: {
      whatsappForms: [
        {
          id: '1',
          name: 'Customer Support Form',
          status: 'PUBLISHED',
          description: 'Customer support form',
          metaFlowId: 'meta-flow-1',
          categories: ['customer_support'],
          definition: JSON.stringify(formJson),
          __typename: 'WhatsappForm',
        },
        {
          id: '2',
          name: 'Feedback Form',
          status: 'PUBLISHED',
          description: 'Feedback collection form',
          metaFlowId: 'meta-flow-2',
          categories: ['survey'],
          definition: JSON.stringify(formJson),
          __typename: 'WhatsappForm',
        },
        {
          id: '3',
          name: 'Lead Generation Form',
          status: 'PUBLISHED',
          description: 'Lead generation form',
          metaFlowId: 'meta-flow-3',
          categories: ['lead_generation'],
          definition: JSON.stringify(formJson),
          __typename: 'WhatsappForm',
        },
        {
          id: '4',
          name: 'Internal Testing Form',
          status: 'DRAFT',
          description: 'Draft form for internal testing',
          metaFlowId: 'meta-flow-4',
          categories: ['other'],
          definition: JSON.stringify(formJson),
          __typename: 'WhatsappForm',
        },
      ],
    },
  },
};

const countWhatsappFormsDraft = {
  request: {
    query: COUNT_WHATSAPP_FORMS,
    variables: {
      filter: { status: 'DRAFT' },
    },
  },
  result: {
    data: {
      countWhatsappForms: 1,
    },
  },
};

export const WHATSAPP_FORM_MOCKS = [
  whatsappFormCategories,
  createdWhatsAppFormQuery,
  getWhatsAppForm,
  listWhatsappFormsWithoutStatus,
  listWhatsappFormsInitial,
  listWhatsappFormsDraft,
  listWhatsappFormsWithThreePublishedwithfilter,
  createdWhatsAppFormQueryWithErrors,
  countWhatsappForms,
  countWhatsappFormsDraft,
];
