import { GET_EXTENSION } from '../graphql/queries/Exntesions';
import { CREATE_EXTENSION } from '../graphql/mutations/Extensions';

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
          code:
            'defmodule Glific.Test.Extension, do :def default_phone(), do: %{phone: 9876543210}',
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

export const createExtension = {
  request: {
    query: CREATE_EXTENSION,
    variables: {
      input: {
        clientId: '5',
        code: 'defmodule Glific.Test.Extension, do: def default_phone(), do: %{phone: 9876543210}',
        isActive: false,
        name: 'Activity',
      },
    },
  },
  result: {
    data: {
      createExtension: {
        extension: {
          code:
            'defmodule Glific.Test.Extension, do: def default_phone(), do: %{phone: 9876543210}',
          isActive: true,
          isValid: true,
          module: 'Elixir.Glific.Test.Extension',
          name: 'Activity',
        },
      },
    },
  },
};
