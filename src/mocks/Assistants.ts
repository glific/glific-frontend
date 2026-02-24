import {
  CREATE_KNOWLEDGE_BASE,
  CREATE_ASSISTANT,
  DELETE_ASSISTANT,
  UPDATE_ASSISTANT,
  UPLOAD_FILE_TO_KAAPI,
} from 'graphql/mutations/Assistant';
import { GET_ASSISTANT, GET_ASSISTANTS, GET_MODELS } from 'graphql/queries/Assistant';

const getAssistantsList = (limit: number = 3) => ({
  request: {
    query: GET_ASSISTANTS,
    variables: {
      filter: {
        name: '',
      },
      opts: {
        limit: 25,
        order: 'DESC',
      },
    },
  },
  result: {
    data: {
      assistants: new Array(limit).fill(null).map((val, ind) => ({
        id: `${ind + 1}`,
        insertedAt: '2024-10-16T15:58:26Z',
        itemId: 'asst_UaWOAyI61Njf9l77Ey9iv0VI',
        name: `Assistant-${ind + 1}`,
      })),
    },
  },
});

const listOpenaiModels = {
  request: {
    query: GET_MODELS,
  },
  result: {
    data: {
      listOpenaiModels: ['gpt-4-turbo', 'gpt-4-turbo-2024-04-09', 'chatgpt-4o-latest', 'gpt-4o'],
    },
  },
};

const createAssistant = {
  request: {
    query: CREATE_ASSISTANT,
    variables: {
      input: {
        instructions: 'test instructions',
        model: 'chatgpt-4o-latest',
        name: 'test name',
        temperature: 1.5,
        knowledgeBaseId: 'kb-1',
        description: 'description for new changes',
      },
    },
  },
  result: {
    data: {
      createAssistant: {
        assistant: {
          id: 4,
          name: 'Assistant-405db438',
        },
      },
    },
  },
};

const getAssistant = (assistantId: string, options?: { legacy?: boolean }) => ({
  request: {
    query: GET_ASSISTANT,
    variables: { assistantId },
  },
  result: {
    data: {
      assistant: {
        __typename: 'AssistantResult',
        assistant: {
          assistantId: 'asst_JhYmNWzpCVBZY2vTuohvmqjs',
          id: assistantId,
          newVersionInProgress: false,
          name: 'Assistant-405db438',
          model: 'gpt-4o',
          instructions: null,
          status: 'active',
          temperature: 1,
          vectorStore: {
            id: 'vs-1',
            name: 'VectorStore-77ae3597',
            legacy: options?.legacy ?? false,
            files: [
              {
                name: 'Accelerator Guide (1).pdf',
                id: 'file-rls90OGDUgFeLewh6e01Eamf',
              },
            ],
          },
        },
      },
    },
  },
});

const loadMoreQuery = {
  request: {
    query: GET_ASSISTANTS,
    variables: { filter: { name: '' }, opts: { limit: 50, offset: 25, order: 'DESC' } },
  },
  result: {
    data: {
      assistants: [],
    },
  },
};

const getAssistantListOnSearch = {
  request: {
    query: GET_ASSISTANTS,
    variables: { filter: { name: 'testAssistant' }, opts: { limit: 25, order: 'DESC' } },
  },
  result: {
    data: {
      assistants: [
        {
          id: `2`,
          insertedAt: '2024-10-16T15:58:26Z',
          itemId: 'asst_UaWOAyI61Njf9l77Ey9iv0VI',
          name: `testAssistant`,
        },
      ],
    },
  },
};

const uploadFileToFileSearch = {
  request: {
    query: UPLOAD_FILE_TO_KAAPI,
  },
  result: {
    data: {
      uploadFilesearchFile: {
        fileId: 'file-rls90OGDUgFeLewh6e01Eamf',
        filename: 'Accelerator Guide (1).pdf',
        uploadedAt: '2024-10-16T15:58:26',
      },
    },
  },
  variableMatcher: (variables: any) => true,
};

export const uploadFileToFileSearchWithError = {
  request: {
    query: UPLOAD_FILE_TO_KAAPI,
  },
  result: {
    data: {
      uploadFilesearchFile: null,
    },
    errors: [
      {
        message: "Files with extension '.csv' not supported in Filesearch",
        locations: [
          {
            line: 2,
            column: 3,
          },
        ],
      },
    ],
  },
  variableMatcher: (variables: any) => true,
};

const fileWithUploadedAt = {
  fileId: 'file-rls90OGDUgFeLewh6e01Eamf',
  filename: 'Accelerator Guide (1).pdf',
  uploadedAt: '2024-10-16T15:58:26',
};

const createKnowledgeBaseMock = (
  mediaInfo: Array<{ fileId: string; filename: string; uploadedAt: string }>,
  assistantId: string | null
) => ({
  request: {
    query: CREATE_KNOWLEDGE_BASE,
    variables: {
      createKnowledgeBaseId: assistantId,
      mediaInfo,
    },
  },
  result: {
    data: {
      createKnowledgeBase: {
        knowledgeBase: {
          id: 'kb-1',
          name: 'KnowledgeBase-1',
        },
      },
    },
  },
});

const createKnowledgeBaseWithError = {
  request: {
    query: CREATE_KNOWLEDGE_BASE,
    variables: {
      createKnowledgeBaseId: '1',
      mediaInfo: [fileWithUploadedAt],
    },
  },
  error: new Error('An error occured'),
};

const updateAssistant = {
  request: {
    query: UPDATE_ASSISTANT,
    variables: {
      updateAssistantId: '1',
      input: {
        instructions: 'test instructions',
        model: 'chatgpt-4o-latest',
        name: 'test name',
        temperature: 1.5,
        knowledgeBaseId: 'vs-1',
      },
    },
  },
  result: {
    data: {
      updateAssistant: {
        errors: null,
      },
    },
  },
};

const removeAssistant = {
  request: {
    query: DELETE_ASSISTANT,
    variables: {
      deleteAssistantId: '1',
    },
  },
  result: {
    data: {
      deleteAssistant: {
        assistant: {
          assistantId: '1',
          name: 'test name',
        },
        errors: null,
      },
    },
  },
};

const uploadFileMocks = [
  uploadFileToFileSearch,
  uploadFileToFileSearch,
  uploadFileToFileSearch,
  createKnowledgeBaseMock([fileWithUploadedAt], null),
  createKnowledgeBaseMock([fileWithUploadedAt, fileWithUploadedAt, fileWithUploadedAt], '1'),
];

export const MOCKS = [
  getAssistantsList(),
  getAssistantsList(),
  createAssistant,
  listOpenaiModels,
  getAssistant('1'),
  getAssistant('1'),
  getAssistant('1'),
  getAssistant('2'),
  getAssistant('2'),
  getAssistant('2'),
  getAssistant('4'),
  getAssistantListOnSearch,
  updateAssistant,
  removeAssistant,
];

export const uploadSupportedFileMocks = [...MOCKS, ...uploadFileMocks];
export const addFilesToFileSearchWithErrorMocks = [...MOCKS, uploadFileToFileSearch, createKnowledgeBaseWithError];

export const legacyVectorStoreMocks = [
  getAssistantsList(),
  listOpenaiModels,
  getAssistant('1', { legacy: true }),
  getAssistant('1', { legacy: true }),
];
export const emptyMocks = [getAssistantsList(0), listOpenaiModels, getAssistant('2')];
export const loadMoreMocks = [getAssistantsList(25), listOpenaiModels, loadMoreQuery, getAssistant('1')];
export const errorMocks = [
  getAssistantsList(4),
  listOpenaiModels,
  getAssistant('1'),
  getAssistant('1'),
  uploadFileToFileSearch,
  uploadFileToFileSearchWithError,
  createKnowledgeBaseMock([fileWithUploadedAt], '1'),
];
