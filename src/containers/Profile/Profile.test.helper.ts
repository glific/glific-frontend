import { GET_CURRENT_USER } from '../../graphql/queries/User';
import { GET_CONTACT_DETAILS, GET_CONTACT } from '../../graphql/queries/Contact';
import { getTagsQuery } from '../Chat/ChatMessages/ChatMessages.test.helper';
import { getLanguagesQuery } from '../Form/FormLayout.test.helper';

const getContactQuery = {
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
          providerStatus: '',
          settings: {},
          tags: [],
        },
      },
    },
  },
};
const date = new Date();

const getContactDetailsQuery = {
  request: {
    query: GET_CONTACT_DETAILS,
    variables: { id: 1 },
  },
  result: {
    data: {
      contact: {
        contact: {
          phone: '+919820198765',
          groups: [
            {
              id: '1',
              label: 'Default group',
            },
          ],
          fields: {},
          lastMessageAt: date.toISOString(),
        },
      },
    },
  },
};

export const LOGGED_IN_USER_MOCK = [
  {
    request: {
      query: GET_CURRENT_USER,
    },
    result: {
      data: {
        currentUser: {
          user: {
            id: '1',
            name: 'John Doe',
            phone: '+919820198765',
            roles: ['admin'],
            contact: {
              id: '1',
            },
          },
        },
      },
    },
  },
  getContactDetailsQuery,
  getTagsQuery,
  getLanguagesQuery,
  getContactQuery,
  getContactDetailsQuery,
];
