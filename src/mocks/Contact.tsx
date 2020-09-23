import { GET_CONTACT_GROUPS, GET_CONTACT, GET_CONTACT_DETAILS } from '../graphql/queries/Contact';
import { getCurrentUserQuery } from './User';
import { filterTagsQuery } from './Tag';
import { getOrganizationQuery } from '../mocks/Organization';

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
  ...getOrganizationQuery,
  getCurrentUserQuery,
  getContactDetailsQuery,
  filterTagsQuery,
  getContactQuery,
  getContactDetailsQuery,
];
