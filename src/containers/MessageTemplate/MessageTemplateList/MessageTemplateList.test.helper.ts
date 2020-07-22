import { GET_LANGUAGES } from '../../../graphql/queries/List';
import { GET_TEMPLATES_COUNT, FILTER_TEMPLATES } from '../../../graphql/queries/Template';
import { DELETE_TEMPLATE } from '../../../graphql/mutations/Template';

const count = {
  request: {
    query: GET_TEMPLATES_COUNT,
    variables: {
      filter: {
        label: '',
      },
    },
  },
  result: {
    data: {
      countSessionTemplates: 2,
    },
  },
};

const filter = {
  request: {
    query: FILTER_TEMPLATES,
    variables: {
      filter: {
        label: '',
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
          label: 'Good message',
        },
      ],
    },
  },
};
export const TEMPLATE_MOCKS = [
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
  count,
  filter,
  filter,
];
