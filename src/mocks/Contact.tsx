import {
  GET_CONTACT_COLLECTIONS,
  GET_CONTACT,
  GET_CONTACT_DETAILS,
  GET_CONTACT_COUNT,
  CONTACT_SEARCH_QUERY,
  GET_CONTACT_HISTORY,
  COUNT_CONTACT_HISTORY,
} from 'graphql/queries/Contact';
import { addFlowToContactQuery } from 'mocks/Flow';
import { getOrganizationLanguagesQuery, getOrganizationQuery } from 'mocks/Organization';
import { UPDATE_CONTACT, UPDATE_CONTACT_TAGS } from 'graphql/mutations/Contact';
import { UPDATE_CONTACT_COLLECTIONS } from 'graphql/mutations/Collection';
import { CLEAR_MESSAGES } from 'graphql/mutations/Chat';
import { setVariables } from 'common/constants';
import { getCurrentUserQuery } from './User';
import { filterTagsQuery } from './Tag';

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
        numberDeleted: 1,
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
          language: { id: '1', label: 'English' },
          groups: [],
          status: 'VALID',
          bspStatus: 'SESSION_AND_HSM',
          settings: {},
          fields: {},
          tags: [{ id: '1', label: 'important' }],
        },
      },
    },
  },
};

export const clearMessagesQuery = {
  request: {
    query: CLEAR_MESSAGES,
    variables: {
      contactId: '2',
    },
  },
  result: {
    data: {
      clearMessages: {
        errors: null,
        success: true,
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
          status: 'VALID',
          optinTime: '2021-08-19T09:28:01Z',
          optoutTime: null,
          optinMethod: 'BSP',
          optoutMethod: null,
          settings: {},
        },
      },
    },
  },
};

export const updateContact = {
  request: {
    query: UPDATE_CONTACT,
    variables: {
      id: 1,
      input: {
        name: 'Default User',
        phone: '+919820198765',
        languageId: 1,
      },
    },
  },
  result: {
    data: {
      contact: {
        id: '1',
        name: 'Default Receiver',
        phone: '99399393303',
        language: { id: '1', label: 'English' },
      },
    },
  },
};

export const updateContactTags = {
  request: {
    query: UPDATE_CONTACT_TAGS,
    variables: {
      input: {
        addTagIds: [],
        contactId: 1,
        deleteTagIds: ['1'],
      },
    },
  },
  result: {
    data: {
      updateContactTags: {
        contactTags: [{ id: '1' }, { id: '2' }],
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
  getContactDetailsQuery,
  addFlowToContactQuery,
  clearMessagesQuery,
  ...getOrganizationQuery,
  updateContact,
  updateContactTags,
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
          maskedPhone: '9876**3211',
          groups: [],
          status: 'hsm',
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

export const contactHistoryQuery = {
  request: {
    query: GET_CONTACT_HISTORY,
    variables: {
      filter: { contactId: '1' },
      opts: {
        limit: 10,
        offset: 0,
        order: 'DESC',
      },
    },
  },
  result: {
    data: {
      contactHistory: [
        {
          eventDatetime: '2021-12-08T06:50:32Z',
          eventLabel: 'Removed from collection: "Optout contacts"',
          eventMeta:
            '{"group":{"uuid":"2","name":"Optout contacts","id":2},"flow":{"uuid":"8c78ffd7-792e-4fa5-878d-266bfa63ae27","name":"test","id":14},"context_id":2}',
          eventType: 'contact_groups_updated',
          id: '1',
          insertedAt: '2021-12-08T06:50:33.000000Z',
          updatedAt: '2021-12-08T06:50:33.000000Z',
        },
      ],
    },
  },
};

export const contactHistoryQueryUpdatedOffset = {
  request: {
    query: GET_CONTACT_HISTORY,
    variables: {
      filter: { contactId: '1' },
      opts: {
        limit: 10,
        offset: 1,
        order: 'DESC',
      },
    },
  },
  result: {
    data: {
      contactHistory: [
        {
          eventDatetime: '2021-12-08T06:50:32Z',
          eventLabel: 'Flow started: "Optout contacts"',
          eventMeta:
            '"flow":{"uuid":"8c78ffd7-792e-4fa5-878d-266bfa63ae27","name":"test","id":14},"context_id":2}',
          eventType: 'contact_flow_started',
          id: '2',
          insertedAt: '2021-12-08T06:50:33.000000Z',
          updatedAt: '2021-12-08T06:50:33.000000Z',
        },
      ],
    },
  },
};

export const countContactHistoryQuery = {
  request: {
    query: COUNT_CONTACT_HISTORY,
    variables: {
      filter: { contactId: '1' },
    },
  },
  result: {
    data: {
      countContactHistory: 2,
    },
  },
};
