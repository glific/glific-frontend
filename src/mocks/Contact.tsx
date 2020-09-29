import {
  GET_CONTACT_GROUPS,
  GET_CONTACT,
  GET_CONTACT_DETAILS,
  GET_CONTACT_COUNT,
} from '../graphql/queries/Contact';
import { getCurrentUserQuery } from './User';
import { filterTagsQuery } from './Tag';
import { getOrganizationQuery } from '../mocks/Organization';
import { UPDATE_CONTACT } from '../graphql/mutations/Contact';

export const contactGroupsQuery = {
  request: {
    query: GET_CONTACT_GROUPS,
    variables: {
      id: '2',
    },
  },
  result: {
    data: {
      contact: {
        contact: {
          groups: [
            {
              id: '1',
              label: 'Default Group',
              users: [],
            },
            {
              id: '2',
              label: 'Staff Group',
              users: [],
            },
          ],
        },
      },
    },
  },
};

export const getContactQuery = {
  request: {
    query: GET_CONTACT,
    variables: { id: 1 },
  },
  result: {
    data: {
      contact: {
        contact: {
          id: '1',
          name: 'Default User',
          phone: '+919820198765',
          language: [],
          status: 'VALID',
          providerStatus: 'SESSION_AND_HSM',
          settings: {},
          fields: {},
          tags: [],
        },
      },
    },
  },
};

const date = new Date();

export const getContactDetailsQuery = {
  request: {
    query: GET_CONTACT_DETAILS,
    variables: { id: 1 },
  },
  result: {
    data: {
      contact: {
        contact: {
          phone: '+919820198765',
          lastMessageAt: date.toISOString(),
          groups: [
            {
              id: '1',
              label: 'Default group',
              users: [],
            },
          ],
          fields: {},
          settings: {},
        },
      },
    },
  },
};

export const LOGGED_IN_USER_MOCK = [
  getCurrentUserQuery,
  getContactDetailsQuery,
  filterTagsQuery,
  getContactQuery,
  getContactDetailsQuery,
  ...getOrganizationQuery,
];

export const updateContactStatusQuery = {
  request: {
    query: UPDATE_CONTACT,
    variables: {
      id: '1',
      input: {
        status: 'VALID',
      },
    },
  },
  result: {
    data: {
      contact: {
        id: '1',
        name: 'Default Receiver',
        phone: '99399393303',
      },
    },
  },
};

export const countGroupContactsQuery = {
  request: {
    query: GET_CONTACT_COUNT,
    variables: { filter: { name: '', includeGroups: 1 } },
  },
  result: {
    data: {
      countContacts: 1,
    },
  },
};
