import { CREATE_ASSISTANT } from 'graphql/mutations/Assistant';
import {
  GET_ASSISTANT,
  GET_ASSISTANTS,
  GET_ASSISTANT_FILES,
  GET_MODELS,
} from 'graphql/queries/Assistant';

const getAssistantsList = {
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
      assistants: [
        {
          __typename: 'Assistant',
          id: '1',
          insertedAt: '2024-10-16T15:58:26Z',
          itemId: 'asst_UaWOAyI61Njf9l77Ey9iv0VI',
          name: 'Assistant-405db438',
        },
        {
          __typename: 'Assistant',
          id: '2',
          insertedAt: '2024-10-16T04:54:20Z',
          itemId: 'asst_yK6kJSsdhsoNHwV6o3lr7dty',
          name: 'Assistan',
        },
        {
          __typename: 'Assistant',
          id: '3',
          insertedAt: '2024-10-15T11:29:28Z',
          itemId: 'asst_JhYmNWzpCVBZY2vTuohvmqjs',
          name: 'cc4d824d',
        },
      ],
    },
  },
};

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

export const MOCKS = [
  getAssistantsList,
  getAssistantsList,
  createAssistant,
  listOpenaiModels,
  getAssistant('1'),
  getAssistant('1'),
  getAssistant('2'),
  getAssistant('2'),
  getAssistant(4),
  getAssistantFiles(4),
  getAssistantFiles('1'),
  getAssistantFiles(4),
  getAssistantFiles('2'),
];
