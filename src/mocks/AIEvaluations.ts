import { CREATE_EVALUATION, CREATE_GOLDEN_QA } from 'graphql/mutations/AIEvaluations';
import {
  COUNT_GOLDEN_QA,
  GET_EVALUATION_SCORES,
  GET_GOLDEN_QA,
  LIST_AI_EVALUATIONS,
  LIST_GOLDEN_QA,
} from 'graphql/queries/AIEvaluations';
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
  goldenQaId: string;
  evaluationName: string;
  configId: string;
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
        goldenQa: { __typename: 'GoldenQa', id: '456', datasetId: '123', name: 'golden_qa', duplication_factor: 1 },
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

export const createGoldenQaCustomSuccessMock = (name: string, duplicationFactor: number, id = '456', datasetId = '999') => ({
  request: { query: CREATE_GOLDEN_QA },
  variableMatcher: () => true,
  result: {
    data: {
      createGoldenQa: {
        __typename: 'CreateGoldenQaPayload',
        goldenQa: { __typename: 'GoldenQa', id, datasetId, name, duplication_factor: duplicationFactor },
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
  {
    __typename: 'GoldenQa',
    id: '1',
    name: 'Diabetescare-0101',
    datasetId: '101',
    insertedAt: new Date().toISOString(),
  },
  {
    __typename: 'GoldenQa',
    id: '2',
    name: 'Healthcare-0102',
    datasetId: '102',
    insertedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    __typename: 'GoldenQa',
    id: '3',
    name: 'Testabc-0801',
    datasetId: '103',
    insertedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    __typename: 'GoldenQa',
    id: '4',
    name: 'GuideMentalHealth-2111',
    datasetId: '104',
    insertedAt: '2024-11-21T00:00:00Z',
  },
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

export const getGoldenQaDownloadMock = (id = '1', signedUrl = 'https://storage.example.com/golden-qa-1.csv') => ({
  request: { query: GET_GOLDEN_QA, variables: { id, includeSignedUrl: true } },
  result: {
    data: {
      goldenQa: {
        __typename: 'GoldenQaPayload',
        goldenQa: {
          __typename: 'GoldenQa',
          id,
          name: 'Diabetescare-0101',
          signedUrl,
          insertedAt: new Date().toISOString(),
        },
        errors: null,
      },
    },
  },
});

export const getGoldenQaDownloadErrorMock = (id = '1') => ({
  request: { query: GET_GOLDEN_QA, variables: { id, includeSignedUrl: true } },
  error: new Error('Failed to generate download URL'),
});

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

// ── AIEvaluationList mocks ────────────────────────────────────────────────────

export const failedEvaluationItem = {
  id: '1',
  name: 'failed-eval',
  status: 'FAILED',
  results: null,
  failureReason: 'Something went wrong',
  goldenQa: { __typename: 'AiEvalGoldenQa', id: '10', name: 'test_dataset', duplicationFactor: 2 },
  assistantConfigVersion: {
    __typename: 'AiEvalConfigVersion',
    id: '1',
    versionNumber: 1,
    assistant: { __typename: 'AiEvalAssistant', id: '45', name: 'Test Assistant' },
  },
  insertedAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:01:00Z',
};

export const completedEvaluationItem = {
  id: '2',
  name: 'completed-eval',
  status: 'COMPLETED',
  results: JSON.stringify({
    summary_scores: [{ name: 'Cosine Similarity', avg: 0.85 }],
  }),
  failureReason: null,
  goldenQa: { __typename: 'AiEvalGoldenQa', id: '11', name: 'healthcare_dataset', duplicationFactor: 3 },
  assistantConfigVersion: {
    __typename: 'AiEvalConfigVersion',
    id: '1',
    versionNumber: 2,
    assistant: { __typename: 'AiEvalAssistant', id: '45', name: 'Health Assistant' },
  },
  insertedAt: '2026-01-02T00:00:00Z',
  updatedAt: '2026-01-02T01:00:00Z',
};

export const runningEvaluationItem = {
  id: '3',
  name: 'running-eval',
  status: 'RUNNING',
  results: null,
  failureReason: null,
  goldenQa: { __typename: 'AiEvalGoldenQa', id: '12', name: 'running_dataset', duplicationFactor: 1 },
  assistantConfigVersion: {
    __typename: 'AiEvalConfigVersion',
    id: '1',
    versionNumber: 1,
    assistant: { __typename: 'AiEvalAssistant', id: '45', name: 'Test Assistant' },
  },
  insertedAt: '2026-01-03T00:00:00Z',
  updatedAt: '2026-01-03T00:00:00Z',
};

export const completedEvaluationWithBothMetrics = {
  id: '4',
  name: 'both-metrics-eval',
  status: 'COMPLETED',
  results: JSON.stringify({
    summary_scores: [
      { name: 'Cosine Similarity', avg: 0.72 },
      { name: 'LLM-as-judge', avg: 0.9 },
    ],
  }),
  failureReason: null,
  goldenQa: { __typename: 'AiEvalGoldenQa', id: '13', name: 'metrics_dataset', duplicationFactor: 2 },
  assistantConfigVersion: {
    __typename: 'AiEvalConfigVersion',
    id: '1',
    versionNumber: 3,
    assistant: { __typename: 'AiEvalAssistant', id: '46', name: 'Multi Metric Assistant' },
  },
  insertedAt: '2026-01-04T00:00:00Z',
  updatedAt: '2026-01-04T02:00:00Z',
};

export const getListAiEvaluationsWithItemsMock = {
  request: { query: LIST_AI_EVALUATIONS },
  variableMatcher: () => true,
  result: { data: { aiEvaluations: [failedEvaluationItem, completedEvaluationItem] } },
};

export const getListAiEvaluationsInvalidResultsMock = {
  request: { query: LIST_AI_EVALUATIONS },
  variableMatcher: () => true,
  result: {
    data: {
      aiEvaluations: [{ ...completedEvaluationItem, id: '5', name: 'bad-results-eval', results: 'not-valid-json{{' }],
    },
  },
};

export const getListAiEvaluationsAllStatusesMock = {
  request: { query: LIST_AI_EVALUATIONS },
  variableMatcher: () => true,
  result: {
    data: {
      aiEvaluations: [failedEvaluationItem, completedEvaluationItem, runningEvaluationItem],
    },
  },
};

export const getListAiEvaluationsBothMetricsMock = {
  request: { query: LIST_AI_EVALUATIONS },
  variableMatcher: () => true,
  result: { data: { aiEvaluations: [completedEvaluationWithBothMetrics] } },
};

export const getEvaluationScoresMock = (id = '2') => ({
  request: { query: GET_EVALUATION_SCORES, variables: { id } },
  result: {
    data: {
      evaluationScores: {
        scores: JSON.stringify({
          score: {
            traces: [
              {
                question_id: 'q1',
                question: 'What is diabetes?',
                ground_truth_answer: 'A metabolic disease',
                llm_answer: 'A chronic condition',
                scores: [{ name: 'Cosine Similarity', value: 0.85 }],
              },
            ],
          },
        }),
        errors: [],
      },
    },
  },
});

export const getEvaluationScoresErrorMock = (id = '2') => ({
  request: { query: GET_EVALUATION_SCORES, variables: { id } },
  result: {
    data: {
      evaluationScores: {
        scores: null,
        errors: [{ message: 'Evaluation scores not found' }],
      },
    },
  },
});

export const getEvaluationScoresNullMock = (id = '2') => ({
  request: { query: GET_EVALUATION_SCORES, variables: { id } },
  result: {
    data: {
      evaluationScores: {
        scores: null,
        errors: [],
      },
    },
  },
});

export const getEvaluationScoresEmptyTracesMock = (id = '2') => ({
  request: { query: GET_EVALUATION_SCORES, variables: { id } },
  result: {
    data: {
      evaluationScores: {
        scores: JSON.stringify({ score: { traces: [] } }),
        errors: [],
      },
    },
  },
});

export const getEvaluationScoresNetworkErrorMock = (id = '2') => ({
  request: { query: GET_EVALUATION_SCORES, variables: { id } },
  error: new Error('Network error'),
});

// scores is a flat array (no score.traces wrapper) → hits extractRows fallback branch
export const getEvaluationScoresFlatArrayMock = (id = '2') => ({
  request: { query: GET_EVALUATION_SCORES, variables: { id } },
  result: {
    data: {
      evaluationScores: {
        scores: JSON.stringify([
          {
            question_id: 'q1',
            question: 'What is diabetes?',
            ground_truth_answer: 'A metabolic disease',
            llm_answer: 'A chronic condition',
            scores: [{ name: 'Cosine Similarity', value: 0.85 }],
          },
        ]),
        errors: [],
      },
    },
  },
});

export const getEvaluationScoresInvalidJsonMock = (id = '2') => ({
  request: { query: GET_EVALUATION_SCORES, variables: { id } },
  result: {
    data: {
      evaluationScores: {
        scores: 'not-valid-json{{',
        errors: [],
      },
    },
  },
});

// traces are arrays (truthy, pass filter(Boolean)) but flattenRow returns null for them → jsonToCsv returns ''
export const getEvaluationScoresInvalidRowsMock = (id = '2') => ({
  request: { query: GET_EVALUATION_SCORES, variables: { id } },
  result: {
    data: {
      evaluationScores: {
        scores: JSON.stringify({
          score: {
            traces: [
              [1, 2],
              [3, 4],
            ],
          },
        }),
        errors: [],
      },
    },
  },
});
