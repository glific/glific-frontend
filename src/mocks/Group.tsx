import { setVariables } from '../common/constants';
import { GET_GROUP_CONTACTS } from '../graphql/queries/Contact';
import {
  FILTER_GROUPS,
  GET_GROUP,
  GET_GROUPS,
  GET_GROUPS_COUNT,
  GET_GROUP_USERS,
} from '../graphql/queries/Group';

export const getGroupQuery = {
  request: {
    query: GET_GROUP,
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

export const getGroupsQuery = {
  request: {
    query: GET_GROUPS,
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
};

export const getGroupUsersQuery = {
  request: {
    query: GET_GROUP_USERS,
    variables: { id: 1 },
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

export const countGroupQuery = {
  request: {
    query: GET_GROUPS_COUNT,
    variables: { filter: { label: '' } },
  },
  result: {
    data: {
      countGroups: 1,
    },
  },
};

export const filterGroupQuery = {
  request: {
    query: FILTER_GROUPS,
    variables: setVariables({ label: '' }, 50, 0, 'ASC'),
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

export const getGroupContactsQuery = {
  request: {
    query: GET_GROUP_CONTACTS,
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
