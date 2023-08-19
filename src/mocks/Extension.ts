import { GET_EXTENSION, GET_ORGANIZATION_EXTENSION } from 'graphql/queries/Extensions';
import { CREATE_EXTENSION, UPDATE_EXTENSION } from 'graphql/mutations/Extensions';

export const getExtension = {
  request: {
    query: GET_EXTENSION,
    variables: {
      clientId: '1',
      id: '1',
    },
  },
  result: {
    data: {
      extension: {
        extension: {
          code: 'defmodule Glific.Test.Extension, do :def default_phone(), do: %{phone: 9876543210}',
          id: '1',
          insertedAt: '2021-05-22T05:34:54Z',
          isActive: false,
          isValid: false,
          name: 'GCS bucket',
          updatedAt: '2021-05-24T10:25:06Z',
        },
      },
    },
  },
};

export const getOrganizationExtension = {
  request: {
    query: GET_ORGANIZATION_EXTENSION,
    variables: {
      clientId: '1',
    },
  },
  result: {
    data: {
      getOrganizationExtension: {
        Extension: {
          code: 'test',
          id: '1',
          insertedAt: '2021-06-17T04:57:05Z',
          isActive: false,
          isValid: null,
          name: 'test',
          organization: {
            isActive: true,
            name: 'Glific',
          },
          updatedAt: '2021-06-17T04:57:05Z',
        },
      },
    },
  },
};
export const getEmptyOrganizationExtension = {
  request: {
    query: GET_ORGANIZATION_EXTENSION,
    variables: {
      clientId: '1',
    },
  },
  result: {
    data: {
      getOrganizationExtension: {
        Extension: null,
      },
    },
  },
};

export const createExtension = {
  request: {
    query: CREATE_EXTENSION,
    variables: {
      input: {
        name: 'GCS bucket',
        code: 'defmodule Glific.Test.Extension, do :def default_phone(), do: %{phone: 9876543210}',
        isActive: false,
        clientId: '1',
      },
    },
  },
  result: {
    data: {
      createExtension: {
        Extension: {
          id: '1',
          code: 'defmodule Glific.Test.Extension, do: def default_phone(), do: %{phone: 9876543210}',
          isActive: false,
          isValid: true,
          module: 'Elixir.Glific.Test.Extension',
          name: 'Activity',
        },
        errors: null,
      },
    },
  },
};

export const updateExtension = {
  request: {
    query: UPDATE_EXTENSION,
    variables: {
      clientId: '1',
      input: { name: 'test', code: 'test', isActive: true, clientId: '1' },
    },
  },
  result: {
    data: {
      update_organization_extension: {
        Extension: {
          id: '1',
          code: 'defmodule Glific.Test.Extension, do: def default_phone(), do: %{phone: 9876543210}',
          isActive: true,
          organization: {
            name: 'Glific',
            isActive: true,
          },
          isValid: true,
          module: 'Elixir.Glific.Test.Extension',
          name: 'Activity',
        },
        errors: null,
      },
    },
  },
};
