import {
  GET_CONTACT_COLLECTIONS,
  GET_CONTACT,
  GET_CONTACT_DETAILS,
  GET_CONTACT_COUNT,
  CONTACT_SEARCH_QUERY,
  GET_CONTACT_HISTORY,
  COUNT_CONTACT_HISTORY,
  GET_CONTACT_PROFILES,
  GET_COLLECTION_CONTACTS,
  GET_CONTACTS_LIST,
  GET_PROFILE,
} from 'graphql/queries/Contact';
import { addFlowToContactQuery } from 'mocks/Flow';
import { getOrganizationLanguagesQuery, getOrganizationQuery } from 'mocks/Organization';
import { UPDATE_CONTACT, MOVE_CONTACTS, IMPORT_CONTACTS } from 'graphql/mutations/Contact';
import { UPDATE_CONTACT_COLLECTIONS } from 'graphql/mutations/Collection';
import { CLEAR_MESSAGES } from 'graphql/mutations/Chat';
import { setVariables } from 'common/constants';
import { getCurrentUserQuery } from './User';
import { TERMINATE_FLOW } from 'graphql/mutations/Flow';

const groups = [
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
];

export const contactCollectionsQuery = (id: number, multipleGroups: boolean = false) => ({
  request: {
    query: GET_CONTACT_COLLECTIONS,
    variables: {
      id: id.toString(),
    },
  },
  result: {
    data: {
      contact: {
        contact: {
          groups: multipleGroups ? [...groups, { id: '3', label: 'Test collection', users: [] }] : groups,
        },
      },
    },
  },
});

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

export const getContactSampleQuery = (variables: any, contactDetails?: any) => {
  return {
    request: {
      query: GET_CONTACT,
      variables,
    },
    result: {
      data: {
        contact: {
          contact: {
            id: '1',
            name: null,
            activeProfile: null,
            phone: '+919820198765',
            language: { id: '1', label: 'English' },
            groups: [],
            status: 'VALID',
            bspStatus: 'SESSION_AND_HSM',
            settings: {},
            fields: '{}',
            ...contactDetails,
          },
        },
      },
    },
  };
};

export const getContactQuery = getContactSampleQuery({ id: '1' });
export const getContactWithMultipleQueries = getContactSampleQuery(
  { id: '2' },
  {
    activeProfile: {
      __typename: 'Profile',
      id: '3',
    },
  }
);

export const getMultipleProfiles = {
  request: {
    query: GET_CONTACT_PROFILES,
    variables: {
      filter: { contactId: '2' },
    },
  },
  result: {
    data: {
      profiles: [
        {
          fields:
            '{"role":{"value":"Student","type":"string","label":"role","inserted_at":"2024-09-08T12:13:37.192507Z"},"name":{"value":"profile name 1","type":"string","label":"Name","inserted_at":"2024-09-08T12:13:37.151339Z"},"age_group":{"value":"19 or above","type":"string","label":"Age Group","inserted_at":"2024-09-08T12:12:45.907810Z"}}',
          id: '2',
          language: {
            id: '1',
          },
          name: 'profile name 1',
          type: 'Student',
        },
        {
          __typename: 'Profile',
          fields:
            '{"role":{"value":"Parent","type":"string","label":"role","inserted_at":"2024-09-08T12:14:25.625321Z"},"name":{"value":"profile name 2","type":"string","label":"Name","inserted_at":"2024-09-08T12:14:25.619652Z"}}',
          id: '3',
          language: {
            __typename: 'Language',
            id: '1',
          },
          name: 'profile name 2',
          type: 'Parent',
        },
      ],
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

export const getContactDetailsQuery = (id: string, attributes: any = {}) => ({
  request: {
    query: GET_CONTACT_DETAILS,
    variables: { id },
  },
  result: {
    data: {
      contact: {
        contact: {
          ...attributes,
          name: 'Default User',
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
      type: 'DATA',
      data: 'name,phone,collection\n  John Doe,919876543210,"Optin collection,Optout Collection"\n  Virat Kohli,919876543220,Cricket',
    },
  },
  result: {
    data: {
      moveContacts: {
        errors: null,
        csvRows: 'Test Row',
        status: 'Import contacts done successfully',
      },
    },
  },
};

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
          optinMethod: 'BSP',
          optinTime: '2024-04-04T12:13:30Z',
          optoutMethod: null,
          optoutTime: null,
          fields: '{}',
        },
        {
          id: '2',
          name: 'Glific User 1',
          phone: '9876543211',
          maskedPhone: '9876**3211',
          groups: [],
          status: 'hsm',
          optinMethod: 'BSP',
          optinTime: '2024-04-04T12:13:30Z',
          optoutMethod: null,
          optoutTime: null,
          fields:
            '{"name":{"value":"fieldValue","type":"string","label":"name","inserted_at":"2024-09-12T14:28:00.680124Z"},"gender":{"value":"Female","type":"string","label":"gender","inserted_at":"2024-09-12T05:00:45.328093Z"},"age":{"value":40,"type":"string","label":"age","inserted_at":"2024-09-12T05:00:45.328093Z"}}',
        },
        {
          id: '3',
          name: 'Glific User 2',
          phone: '9876543211',
          maskedPhone: '9876**3211',
          groups: [],
          status: 'hsm',
          optinMethod: 'BSP',
          optinTime: '2024-04-04T12:13:30Z',
          optoutMethod: null,
          optoutTime: null,
          fields: '{}',
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
          optinMethod: 'BSP',
          optinTime: '2024-04-04T12:13:30Z',
          optoutMethod: null,
          optoutTime: null,
          fields: '{}',
        },
      ],
    },
  },
};

export const getCollectionContactsQuery = (variables: any) => {
  return {
    request: {
      query: CONTACT_SEARCH_QUERY,
      variables: { ...variables },
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
            optinMethod: 'BSP',
            optinTime: '2024-04-04T12:13:30Z',
            optoutMethod: null,
            optoutTime: null,
            fields: '{}',
          },
          {
            id: '2',
            name: 'Glific User 1',
            phone: '9876543211',
            maskedPhone: '987******11',
            groups: [
              {
                id: '1',
                label: 'Default Collection',
              },
            ],
            status: 'INVALID',
            optinMethod: 'BSP',
            optinTime: null,
            optoutMethod: null,
            optoutTime: '2024-04-04T12:13:30Z',
            fields: '{}',
          },
          {
            id: '3',
            name: 'Glific User 2',
            phone: '9876543211',
            maskedPhone: '987******11',
            groups: [
              {
                id: '1',
                label: 'Default Collection',
              },
            ],
            status: 'SESSION',
            optinMethod: '',
            optinTime: '2024-04-04T12:13:30Z',
            optoutMethod: null,
            optoutTime: null,
            fields: '{}',
          },
        ],
      },
    },
  };
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
          eventMeta: '"flow":{"uuid":"8c78ffd7-792e-4fa5-878d-266bfa63ae27","name":"test","id":14},"context_id":2}',
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
      profiles: [],
    },
  },
};

export const getProfileMock = (id: string, profileDetails?: any) => ({
  request: {
    query: GET_PROFILE,
    variables: {
      id,
    },
  },
  result: {
    data: {
      profile: {
        profile: {
          fields: '{}',
          id,
          language: {
            id: '1',
            label: 'English',
          },
          contact: {
            status: 'VALID',
            bspStatus: 'SESSION_AND_HSM',
            settings: {},
          },
          ...profileDetails,
        },
      },
    },
  },
});

export const LOGGED_IN_USER_MOCK = [
  getCurrentUserQuery,
  getCurrentUserQuery,
  getContactProfiles,
  getContactDetailsQuery('1', { activeProfile: null }),
  getContactDetailsQuery('1', { activeProfile: null }),
  getOrganizationLanguagesQuery,
  getOrganizationLanguagesQuery,
  getContactQuery,
  getProfileMock('1', {}),
  addFlowToContactQuery,
  clearMessagesQuery,
  ...getOrganizationQuery,
  updateContact,
];

export const multiple_profile_mock = [
  getContactWithMultipleQueries,
  getContactProfiles,
  getContactDetailsQuery('2', { activeProfile: { id: '2' } }),
  getContactDetailsQuery('2', { activeProfile: { id: '2' } }),
  getCurrentUserQuery,
  getCurrentUserQuery,
  getOrganizationLanguagesQuery,
  getProfileMock('2', {
    fields:
      '{"role":{"value":"Parent","type":"string","label":"role","inserted_at":"2024-09-08T12:14:25.625321Z"},"name":{"value":"profile name 2","type":"string","label":"Name","inserted_at":"2024-09-08T12:14:25.619652Z"}}',
    name: 'profile name 2',
    type: 'Parent',
  }),
  getProfileMock('3', {
    fields:
      '{"role":{"value":"Student","type":"string","label":"role","inserted_at":"2024-09-08T12:14:25.625321Z"},"name":{"value":"profile name 1","type":"string","label":"Name","inserted_at":"2024-09-08T12:14:25.619652Z"}}',
    name: 'profile name 1',
    type: 'Student',
  }),
  getMultipleProfiles,
  getOrganizationLanguagesQuery,
];

export const LOGGED_IN_USER_MULTIPLE_PROFILES = [
  getCurrentUserQuery,
  getContactDetailsQuery('1', { activeProfile: { id: '4', __typename: 'Profile' } }),
  getOrganizationLanguagesQuery,
  getCurrentUserQuery,
  ...getOrganizationQuery,
  getContactQuery,
  getContactProfiles,
];

export const getGroupContact = {
  request: {
    query: GET_COLLECTION_CONTACTS,
    variables: { id: '1' },
  },
  result: {
    data: {
      group: {
        group: {
          contacts: [
            {
              id: '1',
              name: 'Glific User',
              phone: '987654321',
            },
          ],
          waGroups: [
            {
              name: 'Group 1',
              id: '1',
            },
          ],
        },
      },
    },
  },
};

export const getExcludedContactsQuery = (filter?: any) => ({
  request: {
    query: GET_CONTACTS_LIST,
    variables: {
      filter,
      opts: { limit: 50, offset: 0, order: 'ASC' },
    },
  },
  result: {
    data: {
      contacts: [
        {
          __typename: 'Contact',
          groups: [
            {
              __typename: 'Group',
              id: '4',
              label: 'Default Group',
            },
            {
              __typename: 'Group',
              id: '2',
              label: 'Optout contacts',
            },
          ],
          id: '2',
          name: 'NGO Admin',
          fields: '{}',
        },
        {
          __typename: 'Contact',
          groups: [
            {
              __typename: 'Group',
              id: '2',
              label: 'Optout contacts',
            },
          ],
          id: '1',
          name: 'NGO Main Account',
          fields:
            '{"name":{"value":"value","type":"string","label":"name","inserted_at":"2024-09-12T14:28:00.680124Z"},"gender":{"value":"Female","type":"string","label":"gender","inserted_at":"2024-09-12T05:00:45.328093Z"},"age":{"value":40,"type":"string","label":"age","inserted_at":"2024-09-12T05:00:45.328093Z"}}',
        },
        {
          __typename: 'Contact',
          groups: [
            {
              __typename: 'Group',
              id: '2',
              label: 'Optout contacts',
            },
            {
              __typename: 'Group',
              id: '4',
              label: 'Default Group',
            },
          ],
          id: '3',
          name: 'NGO Manager',
          fields:
            '{"name":{"value":"","type":"string","label":"name","inserted_at":"2024-09-12T14:28:00.680124Z"},"gender":{"value":"Female","type":"string","label":"gender","inserted_at":"2024-09-12T05:00:45.328093Z"},"age":{"value":40,"type":"string","label":"age","inserted_at":"2024-09-12T05:00:45.328093Z"}}',
        },
      ],
    },
  },
});

export const importContacts = {
  request: {
    query: IMPORT_CONTACTS,
  },
  result: {
    data: {
      importContacts: {
        errors: null,
        status: 'Test Row',
      },
    },
  },
  variableMatcher: (variables: any) => true,
};

export const terminateFlowQuery = (error: boolean = false) => ({
  request: {
    query: TERMINATE_FLOW,
    variables: {
      contactId: '2',
    },
  },
  result: {
    data: {
      terminateContactFlows: {
        success: !error,
        errors: error ? [{ message: 'Some error occurred' }] : null,
      },
    },
  },
});
