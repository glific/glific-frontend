import { CREATE_EVALUATION, CREATE_GOLDEN_QA } from 'graphql/mutations/AIEvaluations';
import { COUNT_GOLDEN_QA, LIST_AI_EVALUATIONS, LIST_GOLDEN_QA } from 'graphql/queries/AIEvaluations';
import { GET_ASSISTANT_CONFIG_VERSIONS } from 'graphql/queries/Assistant';

export const getListAiEvaluationsMock = {
  request: { query: LIST_AI_EVALUATIONS, variables: { filter: {}, opts: {} } },
  result: { data: { aiEvaluations: [] } },
};

const evaluationSuccessResult = {
  data: {
    createEvaluation: {
      __typename: 'EvaluationResult',
      evaluation: { __typename: 'CreateEvaluationResult', status: 'queued' },
      errors: null,
    },
  },
};

export const getCreateEvaluationMock = {
  request: { query: CREATE_EVALUATION },
  result: evaluationSuccessResult,
};

export const getCreateEvaluationWithVariablesMock = (input: {
  datasetId: number;
  experimentName: string;
  configId: string;
  configVersion: string;
}) => ({
  request: { query: CREATE_EVALUATION, variables: { input } },
  result: evaluationSuccessResult,
});

export const getCreateEvaluationSuccessMock = {
  request: { query: CREATE_EVALUATION },
  variableMatcher: () => true,
  result: evaluationSuccessResult,
};

export const getAssistantConfigVersionsMock = {
  request: { query: GET_ASSISTANT_CONFIG_VERSIONS, variables: { filter: {} } },
  result: {
    data: {
      assistantConfigVersions: [
        {
          __typename: 'AssistantConfigVersion',
          id: '1',
          assistantId: 'a1',
          assistantName: 'Test Assistant',
          versionNumber: 2,
          description: 'v2 config',
          model: 'gpt-4',
          status: 'ACTIVE',
          kaapiUuid: 'kaapi-uuid-a1',
        },
        {
          __typename: 'AssistantConfigVersion',
          id: '2',
          assistantId: 'a1',
          assistantName: 'Test Assistant',
          versionNumber: 1,
          description: 'v1 config',
          model: 'gpt-4',
          status: 'ACTIVE',
          kaapiUuid: 'kaapi-uuid-a1-v1',
        },
      ],
    },
  },
};

export const getAssistantConfigVersionsErrorMock = {
  request: { query: GET_ASSISTANT_CONFIG_VERSIONS, variables: { filter: {} } },
  error: new Error('Failed to fetch assistants'),
};

export const getAssistantConfigVersionsEmptyMock = {
  request: { query: GET_ASSISTANT_CONFIG_VERSIONS, variables: { filter: {} } },
  result: { data: { assistantConfigVersions: [] } },
};

export const getAssistantConfigVersionsLoadingMock = {
  request: { query: GET_ASSISTANT_CONFIG_VERSIONS, variables: { filter: {} } },
  result: { data: { assistantConfigVersions: [] } },
  delay: Infinity,
};

export const getAssistantConfigVersionsMultipleNamesMock = {
  request: { query: GET_ASSISTANT_CONFIG_VERSIONS, variables: { filter: {} } },
  result: {
    data: {
      assistantConfigVersions: [
        {
          __typename: 'AssistantConfigVersion',
          id: '1',
          assistantId: 'a1',
          assistantName: 'Alpha Assistant',
          versionNumber: 1,
          description: 'v1',
          model: 'gpt-4',
          status: 'ACTIVE',
          kaapiUuid: 'kaapi-alpha-v1',
        },
        {
          __typename: 'AssistantConfigVersion',
          id: '2',
          assistantId: 'a2',
          assistantName: 'Beta Assistant',
          versionNumber: 1,
          description: 'v3',
          model: 'gpt-4',
          status: 'ACTIVE',
          kaapiUuid: 'kaapi-beta-v3',
        },
        {
          __typename: 'AssistantConfigVersion',
          id: '3',
          assistantId: 'a2',
          assistantName: 'Beta Assistant',
          versionNumber: 2,
          description: 'v1',
          model: 'gpt-4',
          status: 'ACTIVE',
          kaapiUuid: 'kaapi-beta-v1',
        },
      ],
    },
  },
};

export const createGoldenQaSuccessMock = {
  request: { query: CREATE_GOLDEN_QA },
  variableMatcher: () => true,
  result: {
    data: {
      createGoldenQa: {
        __typename: 'CreateGoldenQaPayload',
        goldenQa: { __typename: 'GoldenQa', datasetId: '123', name: 'golden_qa', duplication_factor: 1 },
        errors: null,
      },
    },
  },
};

export const createGoldenQaErrorMock = {
  request: { query: CREATE_GOLDEN_QA },
  variableMatcher: () => true,
  result: {
    data: {
      createGoldenQa: {
        __typename: 'CreateGoldenQaPayload',
        goldenQa: null,
        errors: [{ __typename: 'Error', message: 'Name already exists', key: 'name' }],
      },
    },
  },
};

export const createGoldenQaNetworkErrorMock = {
  request: { query: CREATE_GOLDEN_QA },
  variableMatcher: () => true,
  error: new Error('Network error'),
};

export const createGoldenQaCustomSuccessMock = (name: string, duplicationFactor: number, datasetId = '456') => ({
  request: { query: CREATE_GOLDEN_QA },
  variableMatcher: () => true,
  result: {
    data: {
      createGoldenQa: {
        __typename: 'CreateGoldenQaPayload',
        goldenQa: { __typename: 'GoldenQa', datasetId, name, duplication_factor: duplicationFactor },
        errors: null,
      },
    },
  },
});

export const createGoldenQaNoMessageErrorMock = {
  request: { query: CREATE_GOLDEN_QA },
  variableMatcher: () => true,
  result: {
    data: {
      createGoldenQa: {
        __typename: 'CreateGoldenQaPayload',
        goldenQa: null,
        errors: [{ __typename: 'Error', message: null, key: 'unknown' }],
      },
    },
  },
};

// ── Golden QA list mocks ──────────────────────────────────────────────────────

const goldenQaSampleRows = [
  { __typename: 'GoldenQa', id: '1', name: 'Diabetescare-0101', datasetId: '101', insertedAt: new Date().toISOString() },
  { __typename: 'GoldenQa', id: '2', name: 'Healthcare-0102', datasetId: '102', insertedAt: new Date(Date.now() - 86400000).toISOString() },
  { __typename: 'GoldenQa', id: '3', name: 'Testabc-0801', datasetId: '103', insertedAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { __typename: 'GoldenQa', id: '4', name: 'GuideMentalHealth-2111', datasetId: '104', insertedAt: '2024-11-21T00:00:00Z' },
];

// Used by AIEvalsPage / GoldenQAList (paginated via List component)
export const getListGoldenQaMock = {
  request: {
    query: LIST_GOLDEN_QA,
    variables: { filter: {}, opts: { limit: 50, offset: 0, orderWith: 'inserted_at', order: 'DESC' } },
  },
  result: { data: { goldenQas: goldenQaSampleRows } },
};

export const getListGoldenQaEmptyMock = {
  request: {
    query: LIST_GOLDEN_QA,
    variables: { filter: {}, opts: { limit: 50, offset: 0, orderWith: 'inserted_at', order: 'DESC' } },
  },
  result: { data: { goldenQas: [] } },
};

// Used by AIEvaluationCreate (fetch all for dropdown)
export const getListGoldenQaForCreateMock = {
  request: { query: LIST_GOLDEN_QA, variables: { filter: {}, opts: {} } },
  result: { data: { goldenQas: goldenQaSampleRows } },
};

export const getListGoldenQaForCreateEmptyMock = {
  request: { query: LIST_GOLDEN_QA, variables: { filter: {}, opts: {} } },
  result: { data: { goldenQas: [] } },
};

export const getListGoldenQaForCreateErrorMock = {
  request: { query: LIST_GOLDEN_QA, variables: { filter: {}, opts: {} } },
  error: new Error('Failed to fetch golden QA datasets'),
};

export const getCountGoldenQaMock = {
  request: { query: COUNT_GOLDEN_QA, variables: { filter: {} } },
  result: { data: { countGoldenQas: 4 } },
};

export const getCountGoldenQaEmptyMock = {
  request: { query: COUNT_GOLDEN_QA, variables: { filter: {} } },
  result: { data: { countGoldenQas: 0 } },
};

export const getAIEvaluationCreateMocks = () => [
  getListAiEvaluationsMock,
  getCreateEvaluationMock,
  getAssistantConfigVersionsMock,
  getListGoldenQaForCreateMock,
];
