import {
  GET_CONTACT_COLLECTIONS,
  GET_CONTACT,
  GET_CONTACT_DETAILS,
  GET_CONTACT_COUNT,
  CONTACT_SEARCH_QUERY,
  GET_CONTACT_HISTORY,
  COUNT_CONTACT_HISTORY,
  GET_CONTACT_PROFILES,
} from 'graphql/queries/Contact';
import { addFlowToContactQuery } from 'mocks/Flow';
import { getOrganizationLanguagesQuery, getOrganizationQuery } from 'mocks/Organization';
import { UPDATE_CONTACT, MOVE_CONTACTS } from 'graphql/mutations/Contact';
import { UPDATE_CONTACT_COLLECTIONS } from 'graphql/mutations/Collection';
import { CLEAR_MESSAGES } from 'graphql/mutations/Chat';
import { setVariables } from 'common/constants';
import { getCurrentUserQuery } from './User';

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
    variables: { id: '1' },
  },
  result: {
    data: {
      contact: {
        contact: {
          id: '1',
          name: 'Default User',
          activeProfile: null,
          phone: '+919820198765',
          language: { id: '1', label: 'English' },
          groups: [],
          status: 'VALID',
          bspStatus: 'SESSION_AND_HSM',
          settings: {},
          fields: {},
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

export const getContactDetailsQuery = (attributes: any = {}) => ({
  request: {
    query: GET_CONTACT_DETAILS,
    variables: { id: '1' },
  },
  result: {
    data: {
      contact: {
        contact: {
          ...attributes,
          activeProfile: null,
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
});

export const updateContact = {
  request: {
    query: UPDATE_CONTACT,
    variables: {
      id: '1',
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
      updateContact: {
        contact: {
          id: '1',
          name: 'Default Receiver',
          phone: '99399393303',
          language: { id: '1', label: 'English' },
        },
      },
    },
  },
};

export const moveContacts = {
  request: {
    query: MOVE_CONTACTS,
    variables: {
      type: "DATA",
      data: "name,phone,collection\n  John Doe,919876543210,\"Optin collection,Optout Collection\"\n  Virat Kohli,919876543220,Cricket"
    }
  },
  result: {
    data: {
      moveContacts: {
        errors: null,
        csvRows: "Test Row"
      }
    }
  }
}

export const countCollectionContactsQuery = {
  request: {
    query: GET_CONTACT_COUNT,
    variables: { filter: { includeGroups: '1' } },
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
export const getContactsSearchQuery = {
  request: {
    query: CONTACT_SEARCH_QUERY,
    variables: setVariables({ name: 'glific' }, 50, 0, 'ASC'),
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
      filter: { includeGroups: '1' },
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
      updateContact: {
        contact: {
          id: '2',
          name: 'Default Receiver',
          phone: '99399393303',
          language: null,
        },
      },
    },
  },
};

export const contactHistoryQuery = {
  request: {
    query: GET_CONTACT_HISTORY,
    variables: {
      filter: { contactId: '1' },
      opts: { limit: 50, offset: 0, order: 'DESC', orderWith: 'inserted_at' },
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

export const getContactProfiles = {
  request: {
    query: GET_CONTACT_PROFILES,
    variables: {
      filter: { contactId: '1' },
    },
  },
  result: {
    data: {
      profiles: [
        {
          fields:
            '{"school":{"value":"Central","type":"string","label":"school","inserted_at":"2022-08-29T09:09:06.606859Z"},"role":{"value":"Teaccher","type":"string","label":"role","inserted_at":"2022-08-29T09:09:06.600165Z"},"name":{"value":"Shamoon","type":"string","label":"Name","inserted_at":"2022-08-29T09:09:06.590965Z"},"age":{"value":"11 to 14","type":"string","label":"age","inserted_at":"2022-08-29T09:09:06.614903Z"}}',
          id: '2',
          language: {
            id: '1',
          },
          name: 'Shamoon',
          type: 'Teaccher',
        },
        {
          fields:
            '{"school":{"value":"killer school","type":"string","label":"school","inserted_at":"2022-08-29T09:09:29.520346Z"},"role":{"value":"student","type":"string","label":"role","inserted_at":"2022-08-29T09:09:29.512350Z"},"name":{"value":"Killer","type":"string","label":"Name","inserted_at":"2022-08-29T09:09:29.506118Z"},"age":{"value":"Less than 10","type":"string","label":"age","inserted_at":"2022-08-29T09:09:29.527986Z"}}',
          id: '3',
          language: {
            id: '2',
          },
          name: 'Killer',
          type: 'student',
        },
        {
          fields:
            '{"school":{"value":"Central","type":"string","label":"school","inserted_at":"2022-08-30T08:36:30.895214Z"},"role":{"value":"Businessman","type":"string","label":"role","inserted_at":"2022-08-30T08:36:30.888247Z"},"name":{"value":"sambhar","type":"string","label":"Name","inserted_at":"2022-08-30T08:36:30.881465Z"},"age":{"value":"19 or above","type":"string","label":"age","inserted_at":"2022-08-30T08:36:30.903089Z"}}',
          id: '4',
          language: {
            id: '1',
          },
          name: 'sambhar',
          type: 'Businessman',
        },
      ],
    },
  },
};

export const LOGGED_IN_USER_MOCK = [
  getCurrentUserQuery,
  getCurrentUserQuery,
  getContactProfiles,
  getContactDetailsQuery(),
  getOrganizationLanguagesQuery,
  getOrganizationLanguagesQuery,
  getContactQuery,
  addFlowToContactQuery,
  clearMessagesQuery,
  ...getOrganizationQuery,
  updateContact,
];

export const LOGGED_IN_USER_MULTIPLE_PROFILES = [
  getCurrentUserQuery,
  getContactDetailsQuery({ activeProfile: { id: '4', __typename: 'Profile' } }),
  getOrganizationLanguagesQuery,
  getCurrentUserQuery,
  ...getOrganizationQuery,
  getContactQuery,
  getContactProfiles,
];
