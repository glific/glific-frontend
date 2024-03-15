import { GET_COLLECTION_CONTACTS } from 'graphql/queries/Contact';
import {
  FILTER_COLLECTIONS,
  GET_COLLECTION,
  GET_COLLECTIONS,
  GET_COLLECTIONS_COUNT,
  GET_COLLECTION_INFO,
  GET_COLLECTION_USERS,
  GET_ORGANIZATION_COLLECTIONS,
} from 'graphql/queries/Collection';
import { UPDATE_COLLECTION_CONTACTS } from 'graphql/mutations/Collection';
import { CONTACTS_COLLECTION, WA_GROUPS_COLLECTION } from 'common/constants';

export const getCollectionQuery = {
  request: {
    query: GET_COLLECTION,
    variables: { id: '1' },
  },
  result: {
    data: {
      group: {
        group: {
          id: '1',
          label: 'Staff group',
          description: 'Only for staff members',
          roles: [],
          users: [
            {
              id: '1',
              name: 'John Doe',
            },
            {
              id: '2',
              name: 'Jane Doe',
            },
          ],
        },
      },
    },
  },
};

export const getCollectionsQuery = [
  {
    request: {
      query: GET_COLLECTIONS,
      variables: { filter: {}, opts: { limit: null, offset: 0, order: 'ASC' } },
    },
    result: {
      data: {
        groups: [
          {
            id: '1',
            label: 'Staff group',
            isRestricted: true,
          },
        ],
      },
    },
  },
  {
    request: {
      query: GET_COLLECTIONS,
    },
    result: {
      data: {
        groups: [
          {
            id: '1',
            label: 'Staff group',
            isRestricted: true,
          },
        ],
      },
    },
  },
];

export const getOrganizationCollections = {
  request: {
    query: GET_ORGANIZATION_COLLECTIONS,
    variables: { organizationGroupsId: '1' },
  },
  result: {
    data: {
      organizationGroups: [
        {
          id: '1',
          label: 'Default group',
        },
        {
          id: '2',
          label: 'Optin group',
        },
      ],
    },
  },
};

export const getCollectionUsersQuery = {
  request: {
    query: GET_COLLECTION_USERS,
    variables: { id: '1' },
  },
  result: {
    data: {
      group: {
        group: {
          users: [
            {
              id: '1',
              name: 'John Doe',
            },
            {
              id: '2',
              name: 'Jane Doe',
            },
          ],
        },
      },
    },
  },
};

export const getCollectionUsersQuery2 = {
  request: {
    query: GET_COLLECTION_USERS,
    variables: { id: '2' },
  },
  result: {
    data: {
      group: {
        group: {
          users: [
            {
              id: '1',
              name: 'John Doe',
            },
            {
              id: '2',
              name: 'Jane Doe',
            },
          ],
        },
      },
    },
  },
};

export const countCollectionQuery = {
  request: {
    query: GET_COLLECTIONS_COUNT,
    variables: {
      filter: {
        groupType: CONTACTS_COLLECTION,
      },
    },
  },
  result: {
    data: {
      countGroups: 1,
    },
  },
};

export const filterCollectionQuery = {
  request: {
    query: FILTER_COLLECTIONS,
    variables: {
      filter: {
        groupType: CONTACTS_COLLECTION,
      },
      opts: {
        limit: 50,
        offset: 0,
        order: 'ASC',
        orderWith: 'label',
      },
    },
  },
  result: {
    data: {
      groups: [
        {
          id: '1',
          label: 'Staff group',
          description: 'Group for staff members',
          isRestricted: false,
          contactsCount: 2,
          roles: [],
          waGroupsCount: 0,
        },
      ],
    },
  },
};

export const filterCollectionQueryWAGroups = {
  request: {
    query: FILTER_COLLECTIONS,
    variables: {
      filter: {
        groupType: WA_GROUPS_COLLECTION,
      },
      opts: {
        limit: 50,
        offset: 0,
        order: 'ASC',
        orderWith: 'label',
      },
    },
  },
  result: {
    data: {
      groups: [
        {
          __typename: 'Group',
          contactsCount: 0,
          description: null,
          id: '1',
          isRestricted: false,
          label: 'Default WA Group Collection',
          roles: [],
          waGroupsCount: 4,
        },
        {
          __typename: 'Group',
          contactsCount: 0,
          description: 'wa collection 1',
          id: '2',
          isRestricted: false,
          label: 'Whatsapp Group Collection 1',
          roles: [],
          waGroupsCount: 1,
        },
      ],
    },
  },
};

export const countCollectionQueryWAGroups = {
  request: {
    query: GET_COLLECTIONS_COUNT,
    variables: {
      filter: {
        groupType: WA_GROUPS_COLLECTION,
      },
    },
  },
  result: {
    data: {
      countGroups: 2,
    },
  },
};

export const getCollectionContactsQuery = {
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
              waGroups: {
                name: null,
                id: null,
              },
            },
          ],
        },
      },
    },
  },
};

export const getCollectionInfo = {
  request: {
    query: GET_COLLECTION_INFO,
    variables: { id: '1' },
  },
  result: {
    data: {
      groupInfo: '{"total":3,"session_and_hsm":1,"session":1,"none":1, "hsm":0}',
    },
  },
};
export const getCollectionInfo2 = {
  request: {
    query: GET_COLLECTION_INFO,
    variables: { id: '2' },
  },
  result: {
    data: {
      groupInfo: '{"total":3,"session_and_hsm":1,"session":1,"none":1, "hsm":0}',
    },
  },
};

export const updateCollectionContactsQuery = {
  request: {
    query: UPDATE_COLLECTION_CONTACTS,
    variables: { input: { addContactIds: ['3'], groupId: '1', deleteContactIds: [] } },
  },
  result: {
    data: {
      updateGroupContacts: {
        groupContacts: [
          {
            id: '19',
            value: null,
          },
        ],
        numberDeleted: 0,
      },
    },
  },
};
