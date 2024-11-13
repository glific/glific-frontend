import {
  ADD_FILES_TO_FILE_SEARCH,
  CREATE_ASSISTANT,
  DELETE_ASSISTANT,
  REMOVE_FILES_FROM_ASSISTANT,
  UPDATE_ASSISTANT,
  UPLOAD_FILE_TO_OPENAI,
} from 'graphql/mutations/Assistant';
import { GET_ASSISTANT, GET_ASSISTANTS, GET_ASSISTANT_FILES, GET_MODELS } from 'graphql/queries/Assistant';

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
        name: null,
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

const getAssistant = (assistantId: any) => ({
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
          insertedAt: '2024-10-15T11:29:28Z',
          instructions: null,
          model: 'gpt-4o',
          name: 'cc4d824d',
          temperature: 1,
          updatedAt: '2024-10-16T15:39:47Z',
        },
      },
    },
  },
});

const getAssistantFiles = (assistantId: any) => ({
  request: {
    query: GET_ASSISTANT_FILES,
    variables: { assistantId },
  },
  result: {
    data: {
      assistant: {
        __typename: 'AssistantResult',
        assistant: {
          __typename: 'Assistant',
          vectorStore: {
            __typename: 'VectorStore',
            files: [
              {
                __typename: 'FileInfo',
                fileId: 'file-rls90OGDUgFeLewh6e01Eamf',
                filename: 'Accelerator Guide (1).pdf',
              },
            ],
            id: assistantId,
            name: 'VectorStore-77ae3597',
            vectorStoreId: 'vs_laIycGtun7qEl0U7zlVsygmy',
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
    query: UPLOAD_FILE_TO_OPENAI,
  },
  result: {
    data: {
      uploadFilesearchFile: {
        fileId: 'file-rls90OGDUgFeLewh6e01Eamf',
        filename: 'Accelerator Guide (1).pdf',
      },
    },
  },
  variableMatcher: (variables: any) => true,
};

const removeFileFromAssistant = {
  request: {
    query: REMOVE_FILES_FROM_ASSISTANT,
    variables: { fileId: 'file-rls90OGDUgFeLewh6e01Eamf', removeAssistantFileId: '1' },
  },
  result: {
    data: {
      removeAssistantFile: {
        assistant: {
          id: '1',
        },
        errors: null,
      },
    },
  },
};

const addFilesToFilesearch = {
  request: {
    query: ADD_FILES_TO_FILE_SEARCH,
    variables: {
      addAssistantFilesId: '1',
      mediaInfo: [
        { fileId: 'file-rls90OGDUgFeLewh6e01Eamf', filename: 'Accelerator Guide (1).pdf' },
        { fileId: 'file-rls90OGDUgFeLewh6e01Eamf', filename: 'Accelerator Guide (1).pdf' },
      ],
    },
  },
  result: {
    data: {
      addAssistantFiles: {
        assistant: {
          id: '1',
        },
        errors: null,
      },
    },
  },
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
      },
    },
  },
  result: {
    data: {
      updateAssistant: {
        assistant: {
          id: '1',
          name: 'test name',
        },
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
  removeFileFromAssistant,
  addFilesToFilesearch,
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
  getAssistantFiles('4'),
  getAssistantFiles('1'),
  getAssistantFiles('1'),
  getAssistantFiles('1'),
  getAssistantFiles(4),
  getAssistantFiles('2'),
  getAssistantFiles('2'),
  getAssistantListOnSearch,
  updateAssistant,
  removeAssistant,
  ...uploadFileMocks,
];

export const emptyMocks = [getAssistantsList(0), listOpenaiModels, getAssistant('2')];

export const loadMoreMocks = [getAssistantsList(25), listOpenaiModels, loadMoreQuery, getAssistant('1')];
