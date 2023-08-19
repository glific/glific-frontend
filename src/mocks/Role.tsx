import { COUNT_ROLES, FILTER_ROLES, GET_ROLE, GET_ROLE_NAMES } from 'graphql/queries/Role';
import { CREATE_ROLE, DELETE_ROLE, UPDATE_ROLE } from 'graphql/mutations/Roles';

export const countRolesQuery = {
  request: {
    query: COUNT_ROLES,
    variables: { filter: {} },
  },
  result: {
    data: { countAccessRoles: 4 },
  },
};

export const createRoleMutation = {
  request: {
    query: CREATE_ROLE,
    variables: { input: { label: 'Teacher', description: 'A teacher role' } },
  },
  result: {
    data: {
      createAccessRole: {
        __typename: 'AccessRoleResult',
        accessRole: {
          __typename: 'AccessRole',
          description: 'A teacher role',
          id: '5',
          isReserved: false,
          label: 'Teacher',
        },
      },
    },
  },
};

export const updateRoleMutation = {
  request: {
    query: UPDATE_ROLE,
    variables: { input: { label: 'Teacher', description: 'A teachers role' } },
  },
  result: {
    data: {
      updateAccessRole: {
        __typename: 'AccessRoleResult',
        accessRole: {
          __typename: 'AccessRole',
          description: 'A teachers role',
          id: '5',
          isReserved: false,
          label: 'Teacher',
        },
      },
    },
  },
};

export const deleteRoleMutation = {
  request: {
    query: DELETE_ROLE,
    variables: { id: '5' },
  },
  result: {
    data: {
      deleteAccessRole: {
        __typename: 'AccessRoleResult',
        accessRole: null,
      },
    },
  },
};

export const filterRolesQuery = {
  request: {
    query: FILTER_ROLES,
    variables: { filter: {}, opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'label' } },
  },
  result: {
    data: {
      accessRoles: [
        {
          __typename: 'AccessRole',
          description: 'Default Admin Role',
          id: '1',
          insertedAt: '2022-06-09T06:49:29Z',
          isReserved: true,
          label: 'Admin',
        },
        {
          __typename: 'AccessRole',
          description: 'Default Manager Role',
          id: '3',
          insertedAt: '2022-06-09T06:49:29Z',
          isReserved: true,
          label: 'Manager',
        },
        {
          __typename: 'AccessRole',
          description: 'Default Role with no permissions',
          id: '4',
          insertedAt: '2022-06-09T06:49:29Z',
          isReserved: true,
          label: 'No access',
        },
        {
          __typename: 'AccessRole',
          description: 'Default Staff Role',
          id: '2',
          insertedAt: '2022-06-09T06:49:29Z',
          isReserved: true,
          label: 'Staff',
        },
      ],
    },
  },
};

export const getRoleQuery = {
  request: {
    query: GET_ROLE,
    variables: { id: '5' },
  },
  result: {
    data: {
      accessRole: {
        __typename: 'AccessRoleResult',
        accessRole: {
          __typename: 'AccessRole',
          description: 'A teacher role',
          insertedAt: '2022-06-09T11:59:35Z',
          isReserved: false,
          label: 'Teacher',
        },
      },
    },
  },
};

export const getRoleNameQuery = {
  request: {
    query: GET_ROLE_NAMES,
    variables: {},
  },
  result: {
    data: {
      accessRoles: [
        {
          __typename: 'AccessRole',
          description: 'Default Admin Role',
          id: '1',
          insertedAt: '2022-06-09T06:49:29Z',
          isReserved: true,
          label: 'Admin',
        },
      ],
    },
  },
};
