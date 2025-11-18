import { CREATE_FORM, UPDATE_FORM, PUBLISH_FORM, DEACTIVATE_FORM } from 'graphql/mutations/WhatsAppForm';
import { GET_WHATSAPP_FORM, LIST_FORM_CATEGORIES, LIST_WHATSAPP_FORMS } from 'graphql/queries/WhatsAppForm';

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
      layout: {},
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
      id: '3',
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
      id: '3',
    },
  },
  error: new Error('Failed to publish'),
};
const listWhatsappForms = {
  request: {
    query: LIST_WHATSAPP_FORMS,
    variables: {
      filter: { status: 'PUBLISHED' },
      opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'name' },
    },
  },
  result: {
    data: {
      listWhatsappForms: [
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

const listWhatsappFormswithoutopts = {
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
          description: 'This is test form',
          metaFlowId: '1473834353902269',
          categories: ['customer_support'],
          definition: JSON.stringify(formJson),
        },
      ],
    },
  },
};
const listWhatsappFormsInactive = {
  request: {
    query: LIST_WHATSAPP_FORMS,
    variables: {
      filter: { status: 'INACTIVE' },
      opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'name' },
    },
  },
  result: {
    data: {
      listWhatsappForms: [
        {
          id: '2',
          name: 'This is form name',
          status: 'INACTIVE',
          description: 'This is test form',
          metaFlowId: '1473834353902269',
          categories: ['customer_support'],
          definition: JSON.stringify(formJson),
        },
      ],
    },
  },
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
      listWhatsappForms: [
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
const listWhatsappFormsEmpty = {
  request: {
    query: LIST_WHATSAPP_FORMS,
    variables: {
      filter: {},
      opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'name' },
    },
  },
  result: {
    data: {
      listWhatsappForms: [
        {
          id: '3',
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

const editWhatsAppForm = {
  request: {
    query: UPDATE_FORM,
    variables: {
      id: '1',
      input: {
        name: 'This is form name',
        formJson: JSON.stringify(formJson),
        description: 'This is an updated test form',
        categories: ['customer_support'],
      },
    },
  },
  result: {
    data: {
      updateWhatsappForm: {
        __typename: 'WhatsappFormResult',
        errors: null,
        whatsappForm: {
          __typename: 'WhatsappForm',
          id: '1',
          name: 'This is form name',
        },
      },
    },
  },
};

export const WHATSAPP_FORM_MOCKS = [
  whatsappFormCategories,
  createdWhatsAppFormQuery,
  getWhatsAppForm,
  editWhatsAppForm,
  listWhatsappForms,
  listWhatsappFormsInactive,
  listWhatsappFormsDraft,
  listWhatsappFormsEmpty,
  listWhatsappFormswithoutopts,
];
