import { GET_LANGUAGES } from '../../graphql/queries/List';
import {
  GET_TEMPLATES_COUNT,
  FILTER_TEMPLATES,
  GET_TEMPLATE,
} from '../../graphql/queries/Template';
import { DELETE_TEMPLATE, CREATE_TEMPLATE } from '../../graphql/mutations/Template';
import { getOrganizationQuery } from '../../mocks/Organization';

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
        limit: 10,
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
          isHsm: false,
          isReserved: false,
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
        limit: 10,
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
          isHsm: true,
          isReserved: false,
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
          isHsm: false,
          isReserved: false,
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
        languageId: 2,
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
          isHsm: true,
          isReserved: false,
        },
      ],
    },
  },
};

export const TEMPLATE_MOCKS = [
  {
    request: {
      query: CREATE_TEMPLATE,
      variables: {
        input: {
          body: 'new Template body',
          label: 'new Template',
          languageId: 2,
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
            isActive: true,
            language: {
              id: 2,
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
        filter: { label: 'new Template', languageId: 2 },
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
            isHsm: true,
            isReserved: false,
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
  ...getOrganizationQuery
];
