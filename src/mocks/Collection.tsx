import { GET_COLLECTION_CONTACTS } from '../graphql/queries/Contact';
import {
  FILTER_COLLECTIONS,
  GET_COLLECTION,
  GET_COLLECTIONS,
  GET_COLLECTIONS_COUNT,
  GET_COLLECTION_INFO,
  GET_COLLECTION_USERS,
} from '../graphql/queries/Collection';

export const getCollectionQuery = {
  request: {
    query: GET_COLLECTION,
    variables: { id: 1 },
  },
  result: {
    data: {
      group: {
        group: {
          id: '1',
          label: 'Staff group',
          description: 'Only for staff members',
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

export const countCollectionQuery = {
  request: {
    query: GET_COLLECTIONS_COUNT,
    variables: { filter: {} },
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
      filter: {},
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
        },
      ],
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
      groupInfo: '{"total":3,"session_and_hsm":1,"session":1,"none":1}',
    },
  },
};
