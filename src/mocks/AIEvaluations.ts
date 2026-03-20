import { CREATE_EVALUATION, CREATE_GOLDEN_QA } from 'graphql/mutations/AIEvaluations';
import { LIST_AI_EVALUATIONS } from 'graphql/queries/AIEvaluations';
import { GET_ASSISTANT_CONFIG_VERSIONS } from 'graphql/queries/Assistant';

export const getListAiEvaluationsMock = {
  request: { query: LIST_AI_EVALUATIONS, variables: { filter: {}, opts: {} } },
  result: { data: { aiEvaluations: [] } },
};

export const getCreateEvaluationMock = {
  request: { query: CREATE_EVALUATION },
  result: { data: { createEvaluation: { status: 'queued', __typename: 'EvaluationPayload' } } },
};

export const getCreateEvaluationWithVariablesMock = (input: {
  datasetId: number;
  experimentName: string;
  configId: string;
  configVersion: string;
}) => ({
  request: { query: CREATE_EVALUATION, variables: { input } },
  result: { data: { createEvaluation: { status: 'queued', __typename: 'EvaluationPayload' } } },
});

export const getCreateEvaluationSuccessMock = {
  request: { query: CREATE_EVALUATION },
  variableMatcher: () => true,
  result: { data: { createEvaluation: { status: 'queued', __typename: 'EvaluationPayload' } } },
};

export const getCreateEvaluationNetworkErrorMock = {
  request: { query: CREATE_EVALUATION },
  variableMatcher: () => true,
  error: new Error('Evaluation failed'),
};

export const getAIEvaluationCreateMocks = () => [
  getListAiEvaluationsMock,
  getCreateEvaluationMock,
  getAssistantConfigVersionsMock,
];

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
