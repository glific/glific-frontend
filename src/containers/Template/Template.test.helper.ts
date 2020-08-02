import { GET_LANGUAGES } from '../../graphql/queries/List';
import { GET_TEMPLATES_COUNT, FILTER_TEMPLATES, GET_TEMPLATE } from '../../graphql/queries/Template';
import { DELETE_TEMPLATE, CREATE_TEMPLATE } from '../../graphql/mutations/Template';

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
          body: 'Hey There',
          id: '87',
          isHsm: false,
          label: 'Good message',
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
}

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
          body: 'This is HSM template',
          id: '98',
          isHsm: true,
          label: 'Good message',
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
          body: 'Hi',
          id: '87',
          isHsm: false,
          label: 'Hello',
          isReserved: false,
        },
      ],
    },
  },
});

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
  count,
  speedSend,
  HSMTemplatecount,
  HSMTemplate,
  filterByBody('hi'),
  filterByBody(''),
];
