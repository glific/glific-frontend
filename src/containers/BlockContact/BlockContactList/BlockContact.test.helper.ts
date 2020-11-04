import { CONTACT_SEARCH_QUERY, GET_CONTACT_COUNT } from '../../../graphql/queries/Contact';
import { updateContactStatusQuery } from '../../../mocks/Contact';

const contactSearchQuery = {
  request: {
    query: CONTACT_SEARCH_QUERY,
    variables: {
      filter: {
        name: '',
        status: 'BLOCKED',
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
      contacts: [
        {
          id: '1',
          name: 'Default receiver',
          phone: '99399393303',
          groups: [
            {
              id: '1',
              label: 'Default group',
            },
          ],
          status: 'BLOCKED',
        },
      ],
    },
  },
};

const contactCountQuery = {
  request: {
    query: GET_CONTACT_COUNT,
    variables: {
      filter: {
        name: '',
        status: 'BLOCKED',
      },
      opts: { limit: 10, offset: 0, order: 'ASC' },
    },
  },
  result: {
    data: {
      countContacts: 1,
    },
  },
};
export const CONTACT_LIST_MOCKS = [
  contactSearchQuery,
  contactSearchQuery,
  contactSearchQuery,
  updateContactStatusQuery,
  contactCountQuery,
  {
    request: {
      query: GET_CONTACT_COUNT,
      variables: {
        filter: {
          name: '',
          status: 'BLOCKED',
        },
      },
    },
    result: {
      data: {
        countContacts: 1,
      },
    },
  },
];
