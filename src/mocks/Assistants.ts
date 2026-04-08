import {
  CLONE_ASSISTANT,
  CREATE_KNOWLEDGE_BASE,
  CREATE_ASSISTANT,
  DELETE_ASSISTANT,
  SET_LIVE_VERSION,
  UPDATE_ASSISTANT,
  UPLOAD_FILE_TO_KAAPI,
} from 'graphql/mutations/Assistant';
import {
  FILTER_ASSISTANTS,
  GET_ASSISTANT,
  GET_ASSISTANT_VERSIONS,
  GET_ASSISTANTS,
  GET_ASSISTANTS_COUNT,
} from 'graphql/queries/Assistant';

const getAssistantsList = (limit: number = 3, cloneStatus: string = 'none') => ({
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
        status: 'ready',
        newVersionInProgress: !!ind,
        cloneStatus,
      })),
    },
  },
});

const createAssistant = {
  request: {
    query: CREATE_ASSISTANT,
    variables: {
      input: {
        instructions: 'test instructions',
        model: 'gpt-4o-mini',
        name: 'test name',
        temperature: 1.5,
        knowledgeBaseVersionId: 'kb-1',
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

export const getAssistant = (
  assistantId: string,
  options?: { legacy?: boolean; newVersionInProgress?: boolean; model?: string; cloneStatus?: string }
) => ({
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
          newVersionInProgress: options?.newVersionInProgress ?? false,
          cloneStatus: options?.cloneStatus ?? 'none',
          name: 'Assistant-405db438',
          model: options?.model ?? 'gpt-4o',
          instructions: null,
          status: 'active',
          temperature: 1,
          vectorStore: {
            id: 'vs-1',
            vectorStoreId: 'vs_abc123',
            knowledgeBaseVersionId: 'llm-vs-1',
            name: 'VectorStore-77ae3597',
            legacy: options?.legacy ?? false,
            size: 32880,
            files: [
              {
                name: 'Accelerator Guide (1).pdf',
                id: 'file-rls90OGDUgFeLewh6e01Eamf',
                fileSize: 32880,
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
          status: 'ready',
          cloneStatus: 'none',
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
        fileSize: 32880,
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
  fileSize: 32880,
};

const createKnowledgeBaseMock = (
  mediaInfo: Array<{ fileId: string; filename: string; uploadedAt: string; fileSize: number }>,
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
          knowledgeBaseVersionId: 'kb-1',
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
        model: 'gpt-4o-mini',
        name: 'test name',
        temperature: 1.5,
        knowledgeBaseVersionId: 'llm-vs-1',
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
  getAssistant('1', { legacy: true }),
  getAssistant('1', { legacy: true }),
];
export const newVersionInProgressMocks = [
  getAssistantsList(),
  getAssistant('1', { newVersionInProgress: true }),
  getAssistant('1', { newVersionInProgress: true }),
];
export const unknownModelMocks = [
  getAssistantsList(),
  getAssistant('1', { model: 'o3-mini' }),
  getAssistant('1', { model: 'o3-mini' }),
];
export const mockVersions = [
  {
    id: 'v1',
    versionNumber: 1,
    model: 'gpt-4o',
    prompt: 'You are a helpful assistant.',
    settings: { temperature: 1 },
    status: 'ready',
    isLive: true,
    description: 'Initial version',
    insertedAt: '2024-10-16T15:00:00Z',
    updatedAt: '2024-10-16T15:00:00Z',
  },
  {
    id: 'v2',
    versionNumber: 2,
    model: 'gpt-4o-mini',
    prompt: 'You are a helpful assistant v2.',
    settings: { temperature: 0.5 },
    status: 'ready',
    isLive: false,
    description: undefined,
    insertedAt: '2024-10-17T15:00:00Z',
    updatedAt: '2024-10-17T15:00:00Z',
  },
];

const getAssistantVersions = (assistantId: string, options?: { liveVersionNumber?: number }) => ({
  request: {
    query: GET_ASSISTANT_VERSIONS,
    variables: { assistantId },
  },
  result: {
    data: {
      assistantVersions: [
        {
          id: 'v1',
          versionNumber: 1,
          model: 'gpt-4o',
          prompt: 'You are a helpful assistant.',
          settings: { temperature: 1 },
          status: 'ready',
          isLive: options?.liveVersionNumber === 1 || options?.liveVersionNumber === undefined ? true : false,
          description: 'Initial version',
          insertedAt: '2024-10-16T15:00:00Z',
          updatedAt: '2024-10-16T15:00:00Z',
        },
        {
          id: 'v2',
          versionNumber: 2,
          model: 'gpt-4o-mini',
          prompt: 'You are a helpful assistant v2.',
          settings: { temperature: 0.5 },
          status: 'ready',
          isLive: options?.liveVersionNumber === 2,
          description: null,
          insertedAt: '2024-10-17T15:00:00Z',
          updatedAt: '2024-10-17T15:00:00Z',
        },
      ],
    },
  },
});

const setLiveVersion = (assistantId: string, versionId: string, liveVersionNumber: number) => ({
  request: {
    query: SET_LIVE_VERSION,
    variables: { assistantId, versionId },
  },
  result: {
    data: {
      setLiveVersion: {
        assistant: {
          id: assistantId,
          activeConfigVersionId: versionId,
          liveVersionNumber,
        },
        errors: null,
      },
    },
  },
});

export const ASSISTANT_DETAIL_MOCKS = [
  getAssistant('1'),
  getAssistant('1'),
  getAssistantVersions('1'),
  getAssistantVersions('1'),
  getAssistantVersions('1'),
];

export const ASSISTANT_DETAIL_SET_LIVE_MOCKS = [
  getAssistant('1'),
  getAssistant('1'),
  getAssistantVersions('1'),
  getAssistantVersions('1'),
  getAssistantVersions('1'),
  setLiveVersion('1', 'v2', 2),
  getAssistantVersions('1', { liveVersionNumber: 2 }),
];

export const ASSISTANT_DETAIL_SAVE_MOCKS = [
  getAssistant('1'),
  getAssistant('1'),
  getAssistantVersions('1'),
  getAssistantVersions('1'),
  getAssistantVersions('1'),
  {
    request: {
      query: UPDATE_ASSISTANT,
      variables: {
        updateAssistantId: '1',
        input: {
          name: 'Assistant-405db438',
          instructions: 'Updated instructions',
          model: 'gpt-4o',
          temperature: 1,
          description: 'Initial version',
          knowledgeBaseVersionId: 'llm-vs-1',
        },
      },
    },
    result: { data: { updateAssistant: { errors: null } } },
  },
];

export const CONFIG_EDITOR_SAVE_MOCKS = [
  getAssistant('1'),
  getAssistant('1'),
  getAssistantVersions('1'),
  getAssistantVersions('1'),
  getAssistantVersions('1'),
  {
    request: {
      query: UPDATE_ASSISTANT,
      variables: {
        updateAssistantId: '1',
        input: {
          name: 'Test Assistant',
          instructions: 'Updated instructions',
          model: 'gpt-4o',
          temperature: 1,
          description: 'Initial version',
          knowledgeBaseVersionId: 'llm-vs-1',
        },
      },
    },
    result: { data: { updateAssistant: { errors: null } } },
  },
];

export const assistantNotFoundMock = {
  request: { query: GET_ASSISTANT, variables: { assistantId: '999' } },
  result: { data: { assistant: null } },
};

export const setLiveVersionErrorMock = {
  request: {
    query: SET_LIVE_VERSION,
    variables: { assistantId: '1', versionId: 'v2' },
  },
  result: {
    data: {
      setLiveVersion: {
        assistant: null,
        errors: [{ key: 'base', message: 'Cannot set live version' }],
      },
    },
  },
};

export const createAssistantSuccessMock = {
  request: {
    query: CREATE_ASSISTANT,
    variables: {
      input: {
        name: 'My Assistant',
        instructions: 'Test instructions',
        model: 'gpt-4o',
        temperature: 0.1,
      },
    },
  },
  result: {
    data: {
      createAssistant: {
        assistant: { id: '99', name: 'My Assistant' },
        errors: [],
      },
    },
  },
};

export const createAssistantErrorMock = {
  request: {
    query: CREATE_ASSISTANT,
    variables: {
      input: {
        name: 'My Assistant',
        instructions: 'Test instructions',
        model: 'gpt-4o',
        temperature: 0.1,
      },
    },
  },
  result: {
    data: {
      createAssistant: {
        assistant: null,
        errors: [{ key: 'base', message: 'Name already taken' }],
      },
    },
  },
};

export const updateAssistantErrorMock = {
  request: {
    query: UPDATE_ASSISTANT,
    variables: {
      updateAssistantId: '1',
      input: {
        name: 'Test Assistant',
        instructions: 'Updated instructions',
        model: 'gpt-4o',
        temperature: 1,
        description: 'Initial version',
        knowledgeBaseVersionId: 'llm-vs-1',
      },
    },
  },
  result: {
    data: {
      updateAssistant: {
        errors: [{ key: 'base', message: 'Update failed' }],
      },
    },
  },
};

export const filterAssistantsMock = {
  request: {
    query: FILTER_ASSISTANTS,
    variables: { filter: {}, opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'name' } },
  },
  result: {
    data: {
      assistants: [
        {
          id: '1',
          name: 'Assistant-1',
          assistantDisplayId: 'asst_abc123',
          liveVersionNumber: 3,
          updatedAt: '2024-10-16T15:58:26Z',
          insertedAt: '2024-10-16T15:58:26Z',
          status: 'active',
          cloneStatus: 'none',
        },
        {
          id: '2',
          name: 'Assistant-2',
          assistantDisplayId: 'asst_def456',
          liveVersionNumber: null,
          updatedAt: '2024-10-17T10:00:00Z',
          insertedAt: '2024-10-17T10:00:00Z',
          status: 'active',
          cloneStatus: 'none',
        },
      ],
    },
  },
};

export const countAssistantsMock = {
  request: {
    query: GET_ASSISTANTS_COUNT,
    variables: { filter: {} },
  },
  result: { data: { countAssistants: 2 } },
};

export const emptyMocks = [getAssistantsList(0), getAssistant('2')];
export const loadMoreMocks = [getAssistantsList(25), loadMoreQuery, getAssistant('1')];
export const errorMocks = [
  getAssistantsList(4),
  getAssistant('1'),
  getAssistant('1'),
  uploadFileToFileSearch,
  uploadFileToFileSearchWithError,
  createKnowledgeBaseMock([fileWithUploadedAt], '1'),
];

const cloneAssistantMock = (id: string) => ({
  request: {
    query: CLONE_ASSISTANT,
    variables: { cloneAssistantId: id },
  },
  result: {
    data: {
      cloneAssistant: {
        message: 'Assistant clone initiated',
        errors: null,
      },
    },
  },
});

const cloneAssistantErrorMock = (id: string) => ({
  request: {
    query: CLONE_ASSISTANT,
    variables: { cloneAssistantId: id },
  },
  result: {
    data: {
      cloneAssistant: {
        message: null,
        errors: [{ key: 'clone', message: 'Clone failed' }],
      },
    },
  },
});

export const createAssistantConfigMock = {
  request: {
    query: CREATE_ASSISTANT,
    variables: {
      input: {
        name: 'My Assistant',
        instructions: 'Test instructions',
        model: 'gpt-4o',
        temperature: 0.1,
      },
    },
  },
  result: {
    data: {
      createAssistant: {
        assistant: { id: '5', name: 'My Assistant' },
        errors: [],
      },
    },
  },
};

export const clonePendingMocks = [
  getAssistantsList(3, 'pending'),
  getAssistant('1', { cloneStatus: 'pending' }),
  getAssistant('1', { cloneStatus: 'pending' }),
  cloneAssistantMock('1'),
  getAssistant('1', { cloneStatus: 'completed' }),
];

export const cloneCompletedMocks = [
  getAssistantsList(3, 'completed'),
  getAssistant('1', { cloneStatus: 'completed' }),
  getAssistant('1', { cloneStatus: 'completed' }),
];

export const cloneFailedMocks = [
  getAssistantsList(3, 'failed'),
  getAssistant('1', { cloneStatus: 'failed' }),
  getAssistant('1', { cloneStatus: 'failed' }),
  cloneAssistantMock('1'),
];

export const cloneErrorMocks = [
  getAssistantsList(3, 'pending'),
  getAssistant('1', { cloneStatus: 'pending' }),
  getAssistant('1', { cloneStatus: 'pending' }),
  cloneAssistantErrorMock('1'),
];
