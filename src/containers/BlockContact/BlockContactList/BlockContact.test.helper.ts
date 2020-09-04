import { CONTACT_SEARCH_QUERY, GET_CONTACT_COUNT } from '../../../graphql/queries/Contact';

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
        },
      ],
    },
  },
};
export const CONTACT_LIST_MOCKS = [
  contactSearchQuery,
  contactSearchQuery,
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
