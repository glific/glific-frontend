import { CREATE_ASSISTANT } from 'graphql/mutations/Assistants';
import {
  CREATE_STORAGE,
  REMOVE_FILES_FROM_STORAGE,
  UPDATE_VECTORE_STORE,
  UPLOAD_FILES_TO_STORAGE,
} from 'graphql/mutations/Storage';
import {
  VECTOR_STORE,
  VECTOR_STORES,
  VECTOR_STORE_ASSISTANTS,
  VECTOR_STORE_FILES,
} from 'graphql/queries/Storage';

const vectorStores = [
  {
    id: '5',
    insertedAt: '2024-09-30T09:18:44Z',
    itemId: 'vs_HFGiyvbrl4c4Xx32ijAXhzd7',
    name: 'Vector store 1',
    size: '0 B',
    updatedAt: '2024-09-30T09:18:44Z',
  },
  {
    id: '4',
    insertedAt: '2024-09-30T09:18:41Z',
    itemId: 'vs_hj6RA1dugBnhS8aT8MQtKnh2',
    name: 'vector_store_4',
    size: '0 B',
    updatedAt: '2024-09-30T09:18:41Z',
  },
  {
    id: '3',
    insertedAt: '2024-09-30T09:18:36Z',
    itemId: 'vs_zcpHvcavkechKSUb3Iph70La',
    name: 'vector_store_3',
    size: '6.79 MB',
    updatedAt: '2024-10-01T07:11:39Z',
  },
  {
    id: '2',
    insertedAt: '2024-09-30T09:18:31Z',
    itemId: 'vs_W7Rqngj87FuXoUP6Sjd5MSjs',
    name: 'vector_store_2',
    size: '8.67 MB',
    updatedAt: '2024-10-01T07:15:52Z',
  },
  {
    id: '1',
    insertedAt: '2024-09-30T08:35:49Z',
    itemId: 'vs_gWTjKCBJfGfWxHtsfi2uGdCA',
    name: 'vector_store_1',
    size: '0 B',
    updatedAt: '2024-09-30T08:35:49Z',
  },
];

export const vectorStorageMocks = (
  data: any[] = vectorStores,
  searchTerm: string = '',
  opts: any = {
    limit: 25,
    order: 'DESC',
  }
) => ({
  request: {
    query: VECTOR_STORES,
    variables: {
      filter: { name: searchTerm },
      opts,
    },
  },
  result: {
    data: {
      vectorStores: data,
    },
  },
});

const getVectorStoreQuery = (vectorStoreId: string, name: string) => ({
  request: {
    query: VECTOR_STORE,
    variables: { vectorStoreId },
  },
  result: {
    data: {
      vectorStore: {
        errors: null,
        vectorStore: {
          id: vectorStoreId,
          name,
          assistants: [],
          files: [],
          insertedAt: '2024-10-01T07:00:12Z',
          size: '0 B',
          updatedAt: '2024-10-01T07:56:19Z',
          vectorStoreId: 'vs_6RJD1TRI6Ny9P8YA7FhR9b4w',
        },
      },
    },
  },
});

const createVectorStore = {
  request: {
    query: CREATE_STORAGE,
    variables: {
      input: {
        name: null,
      },
    },
  },
  result: {
    data: {
      createVectorStore: {
        vectorStore: {
          assistants: [],
          files: [],
          id: '11',
          insertedAt: '2024-10-03T07:44:25Z',
          name: 'vectorStore1-035b5b90',
          size: '0 B',
          vectorStoreId: 'vs_LUz7uG6KuWVXxoB9IzN5VdI5',
        },
      },
    },
  },
};

const updateNameQuery = {
  request: {
    query: UPDATE_VECTORE_STORE,
    variables: {
      updateVectorStoreId: '5',
      input: {
        name: 'updated name',
      },
    },
  },
  result: {
    data: {
      updateVectorStore: {
        vectorStore: {
          id: '5',
          name: 'updated name',
        },
      },
    },
  },
};

const getVectorStorFiles = {
  request: {
    query: VECTOR_STORE_FILES,
    variables: { vectorStoreId: '5' },
  },
  result: {
    data: {
      vectorStore: {
        errors: null,
        vectorStore: {
          __typename: 'VectorStore',
          files: [
            { id: '1', name: 'file1', size: '0 B' },
            { id: '2', name: 'file2', size: '0 B' },
          ],
          id: '10',
          name: 'Vector store for testing sss',
        },
      },
    },
  },
};

const getVectorStoreAssistants = {
  request: {
    query: VECTOR_STORE_ASSISTANTS,
    variables: { vectorStoreId: '5' },
  },
  result: {
    data: {
      vectorStore: {
        errors: null,
        vectorStore: {
          __typename: 'VectorStore',
          assistants: [],
          id: '10',
          name: 'Vector store for testing sss',
        },
      },
    },
  },
};

const addFilesToVectorStore = {
  request: {
    query: UPLOAD_FILES_TO_STORAGE,
  },
  result: {
    data: {
      addVectorStoreFiles: {
        errors: null,
        vectorStore: {
          __typename: 'VectorStore',
          files: [{ id: '1', name: 'file1', size: '0 B' }],
          id: '10',
        },
      },
    },
  },
  variableMatcher: (variables: any) => true,
};

const removeFilesFromVectorStore = {
  request: {
    query: REMOVE_FILES_FROM_STORAGE,
    variables: { fileId: '2', removeVectorStoreFileId: '5' },
  },
  result: {
    data: {
      removeVectorStoreFile: {
        errors: null,
        vectorStore: {
          id: '5',
        },
      },
    },
  },
};

const addAssistant = {
  request: {
    query: CREATE_ASSISTANT,
    variables: {
      input: {
        vectorStoreId: '5',
      },
    },
  },
  result: {
    data: {
      createAssistant: {
        assistant: {
          id: '1',
          name: 'assistant',
        },
      },
    },
  },
};

export const VECTOR_STORE_MOCKS = [
  vectorStorageMocks(),
  vectorStorageMocks(),
  getVectorStoreQuery('5', 'Vector store 1'),
  getVectorStoreQuery('5', 'Vector store 1'),
  getVectorStoreQuery('5', 'Vector store 1'),
  getVectorStoreQuery('4', 'vector_store_4'),
  updateNameQuery,
  vectorStorageMocks(vectorStores.slice(1, 2), 'vector_store_4'),
  addFilesToVectorStore,
  getVectorStorFiles,
  getVectorStoreAssistants,
  removeFilesFromVectorStore,
  getVectorStorFiles,
  createVectorStore,
  addAssistant,
];

const vectors = (limit: number = 25) =>
  new Array(limit).fill(null).map((val, ind) => ({
    id: `${ind + 1}`,
    insertedAt: '2024-09-30T09:18:44Z',
    itemId: 'vs_HFGiyvbrl4c4Xx32ijAXhzd7',
    name: `vector_store_${ind + 1}`,
    size: '0 B',
    updatedAt: '2024-09-30T09:18:44Z',
  }));

export const loadMoreMocks = [
  vectorStorageMocks(vectors(), ''),
  getVectorStoreQuery('1', 'vector_store_1'),
  vectorStorageMocks(vectors(50), '', { limit: 50, offset: 25, order: 'DESC' }),
];
