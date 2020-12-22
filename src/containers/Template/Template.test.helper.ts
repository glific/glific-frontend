import { GET_LANGUAGES } from '../../graphql/queries/List';
import {
  GET_TEMPLATES_COUNT,
  FILTER_TEMPLATES,
  GET_TEMPLATE,
  GET_HSM_CATEGORIES,
} from '../../graphql/queries/Template';
import { DELETE_TEMPLATE, CREATE_TEMPLATE } from '../../graphql/mutations/Template';
import {
  getOrganizationLanguagesQuery,
  getOrganizationLanguagesQueryByOrder,
  getOrganizationQuery,
} from '../../mocks/Organization';

const count = {
  request: {
    query: GET_TEMPLATES_COUNT,
    variables: {
      filter: {
        label: '',
        isHsm: false,
      },
    },
  },
  result: {
    data: {
      countSessionTemplates: 2,
    },
  },
};

const speedSend = {
  request: {
    query: FILTER_TEMPLATES,
    variables: {
      filter: {
        label: '',
        isHsm: false,
      },

      opts: {
        limit: 50,
        offset: 0,
        order: 'ASC',
      },
    },
  },
  result: {
    data: {
      sessionTemplates: [
        {
          id: '87',
          body: 'Hey There',
          label: 'Good message',
          shortcode: 'test',
          isHsm: false,
          isReserved: false,
          updatedAt: '2020-12-01T18:00:28Z',
          translations: '{}',
          type: 'TEXT',
          language: {
            id: '1',
            label: 'Hindi',
          },
          MessageMedia: {
            id: 1,
            caption: 'Test',
            sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
          },
        },
      ],
    },
  },
};

const HSMTemplatecount = {
  request: {
    query: GET_TEMPLATES_COUNT,
    variables: {
      filter: {
        label: '',
        isHsm: true,
      },
    },
  },
  result: {
    data: {
      countSessionTemplates: 2,
    },
  },
};

const HSMTemplate = {
  request: {
    query: FILTER_TEMPLATES,
    variables: {
      filter: {
        label: '',
        isHsm: true,
      },

      opts: {
        limit: 50,
        offset: 0,
        order: 'ASC',
      },
    },
  },
  result: {
    data: {
      sessionTemplates: [
        {
          id: '98',
          body: 'This is HSM template',
          label: 'Good message',
          shortcode: 'test',
          isHsm: true,
          isReserved: false,
          translations: '{}',
          type: 'TEXT',
          language: {
            id: '1',
            label: 'Hindi',
          },
          MessageMedia: {
            id: 1,
            caption: 'Test',
            sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
          },
        },
      ],
    },
  },
};

const filterByBody = (body: string) => ({
  request: {
    query: FILTER_TEMPLATES,
    variables: {
      filter: {
        body: body,
      },
      opts: {
        order: 'ASC',
      },
    },
  },
  result: {
    data: {
      sessionTemplates: [
        {
          id: '87',
          body: 'Hi',
          label: 'Hello',
          shortcode: 'test',
          isHsm: false,
          isReserved: false,
          translations: '{}',
          type: 'TEXT',
          language: {
            id: '1',
            label: 'Hindi',
          },
          MessageMedia: {
            id: 1,
            caption: 'Test',
            sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
          },
        },
      ],
    },
  },
});

const speedSendValidation = {
  request: {
    query: FILTER_TEMPLATES,
    variables: {
      filter: {
        label:
          'We are not allowing a really long title, and we should trigger validation for this.',
        languageId: 1,
      },
      opts: { order: 'ASC', limit: null, offset: 0 },
    },
  },
  result: {
    data: {
      sessionTemplates: [
        {
          id: '98',
          body: 'This is HSM template',
          label:
            'We are not allowing a really long title, and we should trigger validation for this',
          shortcode: 'test',
          isHsm: true,
          isReserved: false,
          translations: '{}',
          type: 'TEXT',
          language: {
            id: '1',
            label: 'Hindi',
          },
          MessageMedia: {
            id: 1,
            caption: 'Test',
            sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
          },
        },
      ],
    },
  },
};

export const whatsappHsmCategories = [
  {
    request: {
      query: GET_HSM_CATEGORIES,
      variables: {},
    },
    result: {
      data: {
        whatsappHsmCategories: [
          'ACCOUNT_UPDATE',
          'PAYMENT_UPDATE',
          'PERSONAL_FINANCE_UPDATE',
          'SHIPPING_UPDATE',
          'RESERVATION_UPDATE',
          'ISSUE_RESOLUTION',
          'APPOINTMENT_UPDATE',
          'TRANSPORTATION_UPDATE',
          'TICKET_UPDATE',
          'ALERT_UPDATE',
          'AUTO_REPLY',
        ],
      },
    },
  },
];

export const TEMPLATE_MOCKS = [
  {
    request: {
      query: CREATE_TEMPLATE,
      variables: {
        input: {
          body: 'new Template body',
          label: 'new Template',
          languageId: 1,
          type: 'TEXT',
        },
      },
    },
    result: {
      data: {
        createSessionTemplate: {
          sessionTemplate: {
            body: 'new Template body',
            id: '121',
            label: 'new Template',
          },
        },
      },
    },
  },
  {
    request: {
      query: GET_TEMPLATE,
      variables: {
        id: 1,
      },
    },
    result: {
      data: {
        sessionTemplate: {
          sessionTemplate: {
            id: 1,
            label: 'important',
            body: 'important template',
            example: 'important template',
            isActive: true,
            language: {
              id: 1,
            },
          },
        },
      },
    },
  },
  {
    request: {
      query: GET_TEMPLATE,
      variables: {
        id: 1,
      },
    },
    result: {
      data: {
        sessionTemplate: {
          sessionTemplate: {
            id: 1,
            label: 'important',
            body: 'important template',
            example: 'important template',
            isActive: true,
            language: {
              id: 1,
            },
          },
        },
      },
    },
  },
  {
    request: {
      query: DELETE_TEMPLATE,
      variables: {
        id: '87',
      },
    },
    result: {
      data: {
        deleteSessionTemplate: {
          errors: null,
        },
      },
    },
  },
  {
    request: {
      query: GET_LANGUAGES,
    },
    result: {
      data: {
        languages: [
          {
            id: '1',
            label: 'English (United States)',
          },
          {
            id: '2',
            label: 'Hindi (India)',
          },
        ],
      },
    },
  },
  {
    request: {
      query: FILTER_TEMPLATES,
      variables: {
        filter: { label: 'new Template', languageId: 1 },
        opts: { order: 'ASC', limit: null, offset: 0 },
      },
    },
    result: {
      data: {
        sessionTemplates: [
          {
            id: '98',
            body: 'This is HSM template',
            label: 'new Template',
            shortcode: 'test',
            isHsm: true,
            isReserved: false,
            updatedAt: '2020-12-01T18:00:32Z',
            translations: '{}',
            type: 'TEXT',
            language: {
              id: '1',
              label: 'Hindi',
            },
            MessageMedia: {
              id: 1,
              caption: 'Test',
              sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
            },
          },
        ],
      },
    },
  },

  {
    request: {
      query: FILTER_TEMPLATES,
      variables: {
        filter: { label: '', isHsm: false },
        opts: { order: 'ASC', limit: 50, offset: 0, orderWith: 'label' },
      },
    },
    result: {
      data: {
        sessionTemplates: [
          {
            id: '98',
            body: 'This is HSM template',
            label: 'new Template',
            shortcode: 'test',
            isHsm: true,
            isReserved: false,
            updatedAt: '2020-12-01T18:00:32Z',
            translations: '{}',
            type: 'TEXT',
            language: {
              id: '1',
              label: 'Hindi',
            },
            MessageMedia: {
              id: 1,
              caption: 'Test',
              sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
            },
          },
        ],
      },
    },
  },
  {
    request: {
      query: FILTER_TEMPLATES,
      variables: {
        filter: { label: '', isHsm: false },
        opts: { order: 'ASC', limit: 50, offset: 0, orderWith: 'label' },
      },
    },
    result: {
      data: {
        sessionTemplates: [
          {
            id: '98',
            body: 'This is HSM template',
            label: 'new Template',
            shortcode: 'test',
            isHsm: true,
            isReserved: false,
            updatedAt: '2020-12-01T18:00:32Z',
            translations: '{}',
            type: 'TEXT',
            language: {
              id: '1',
              label: 'Hindi',
            },
            MessageMedia: {
              id: 1,
              caption: 'Test',
              sourceUrl: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
            },
          },
        ],
      },
    },
  },
  count,
  speedSend,
  HSMTemplatecount,
  HSMTemplate,
  filterByBody('hi'),
  filterByBody(''),
  speedSendValidation,
  ...getOrganizationQuery,
  getOrganizationLanguagesQuery,
  getOrganizationLanguagesQueryByOrder,
  ...whatsappHsmCategories,
];
