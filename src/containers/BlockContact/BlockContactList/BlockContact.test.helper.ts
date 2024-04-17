import { CONTACT_SEARCH_QUERY, GET_CONTACT_COUNT } from 'graphql/queries/Contact';
import { updateContactStatusQuery } from 'mocks/Contact';

const contactSearchQuery = {
  request: {
    query: CONTACT_SEARCH_QUERY,
    variables: {
      filter: {
        status: 'BLOCKED',
      },
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
      contacts: [
        {
          id: '1',
          name: 'Default receiver',
          phone: '99399393303',
          maskedPhone: '99399393303',
          groups: [
            {
              id: '1',
              label: 'Default collection',
            },
          ],
          status: 'BLOCKED',
          optinTime: '2021-08-19T09:28:01Z',
          optoutTime: null,
          optinMethod: 'BSP',
          optoutMethod: null,
        },
      ],
    },
  },
};

const contactSearchQueryBlocked = {
  request: {
    query: CONTACT_SEARCH_QUERY,
    variables: {
      filter: {
        name: '',
        status: 'BLOCKED',
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
      contacts: [
        {
          id: '1',
          name: 'Default receiver',
          phone: '99399393303',
          maskedPhone: '99399393303',
          groups: [
            {
              id: '1',
              label: 'Default collection',
            },
          ],
          status: 'BLOCKED',
          optinTime: '2021-08-19T09:28:01Z',
          optoutTime: null,
          optinMethod: 'BSP',
          optoutMethod: null,
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
        status: 'BLOCKED',
      },
    },
  },
  result: {
    data: {
      countContacts: 1,
    },
  },
};

const contactSearchQueryBlockedCount = {
  request: {
    query: GET_CONTACT_COUNT,
    variables: {
      filter: {
        name: '',
        status: 'BLOCKED',
      },
      opts: { limit: 50, offset: 0, order: 'ASC' },
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
  contactSearchQueryBlocked,
  contactSearchQueryBlockedCount,
  updateContactStatusQuery,
  contactCountQuery,
  contactCountQuery,
  {
    request: {
      query: GET_CONTACT_COUNT,
      variables: {
        filter: {
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
