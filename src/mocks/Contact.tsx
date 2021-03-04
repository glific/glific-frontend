import {
  GET_CONTACT_COLLECTIONS,
  GET_CONTACT,
  GET_CONTACT_DETAILS,
  GET_CONTACT_COUNT,
  CONTACT_SEARCH_QUERY,
} from '../graphql/queries/Contact';
import { getCurrentUserQuery } from './User';
import { filterTagsQuery } from './Tag';
import { getOrganizationLanguagesQuery, getOrganizationQuery } from '../mocks/Organization';
import { UPDATE_CONTACT } from '../graphql/mutations/Contact';
import { UPDATE_CONTACT_COLLECTIONS } from '../graphql/mutations/Collection';
import { setVariables } from '../common/constants';

export const contactCollectionsQuery = {
  request: {
    query: GET_CONTACT_COLLECTIONS,
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
              label: 'Default Collection',
              users: [],
            },
            {
              id: '2',
              label: 'Staff Collection',
              users: [],
            },
          ],
        },
      },
    },
  },
};

export const updateContactCollectionQuery = {
  request: {
    query: UPDATE_CONTACT_COLLECTIONS,
    variables: {
      input: { contactId: '2', addGroupIds: [], deleteGroupIds: ['1', '2'] },
    },
  },
  result: {
    data: {
      updateContactGroups: {
        contactGroups: {
          id: '18',
          value: null,
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
          groups: [],
          status: 'VALID',
          bspStatus: 'SESSION_AND_HSM',
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
          maskedPhone: '+919820198765',
          lastMessageAt: date.toISOString(),
          groups: [
            {
              id: '1',
              label: 'Default collection',
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
  getOrganizationLanguagesQuery,
  getOrganizationLanguagesQuery,
  filterTagsQuery,
  getCurrentUserQuery,
  getContactQuery,
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

export const countCollectionContactsQuery = {
  request: {
    query: GET_CONTACT_COUNT,
    variables: { filter: { includeGroups: 1 } },
  },
  result: {
    data: {
      countContacts: 1,
    },
  },
};
export const getContactsQuery = {
  request: {
    query: CONTACT_SEARCH_QUERY,
    variables: setVariables({ name: '' }, 50, 0, 'ASC'),
  },
  result: {
    data: {
      contacts: [
        {
          id: '1',
          name: 'Glific User',
          phone: '9876543211',
        },
      ],
    },
  },
};

export const getCollectionContactsQuery = {
  request: {
    query: CONTACT_SEARCH_QUERY,
    variables: {
      filter: { includeGroups: 1 },
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
          name: 'Glific User',
          phone: '9876543211',
          maskedPhone: '987******11',
          groups: [
            {
              id: '1',
              label: 'Default Collection',
            },
          ],
          status: 'SESSION',
        },
      ],
    },
  },
};

export const blockContactQuery = {
  request: {
    query: UPDATE_CONTACT,
    variables: {
      id: '2',
      input: {
        status: 'BLOCKED',
      },
    },
  },
  result: {
    data: {
      contact: {
        id: '2',
        name: 'Default Receiver',
        phone: '99399393303',
        language: null,
      },
    },
  },
};
