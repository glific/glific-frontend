import { CREATE_EVALUATION } from 'graphql/mutations/AIEvaluations';
import { GET_GOLDEN_QA } from 'graphql/queries/AIEvaluations';

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

export const getGoldenQaDownloadErrorMock = (id = '1') => ({
  request: { query: GET_GOLDEN_QA, variables: { id, includeSignedUrl: true } },
  error: new Error('Failed to generate download URL'),
});

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
    majorVersion: 1,
    minorVersion: 0,
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
    majorVersion: 2,
    minorVersion: 0,
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
    majorVersion: 1,
    minorVersion: 0,
    assistant: { __typename: 'AiEvalAssistant', id: '45', name: 'Test Assistant' },
  },
  insertedAt: '2026-01-03T00:00:00Z',
  updatedAt: '2026-01-03T00:00:00Z',
};

export const secondCompletedEvaluationItem = {
  id: '5',
  name: 'second-completed-eval',
  status: 'COMPLETED',
  results: JSON.stringify({
    summary_scores: [{ name: 'Cosine Similarity', avg: 0.75 }],
  }),
  failureReason: null,
  goldenQa: { __typename: 'AiEvalGoldenQa', id: '15', name: 'second_dataset', duplicationFactor: 1 },
  assistantConfigVersion: {
    __typename: 'AiEvalConfigVersion',
    id: '2',
    majorVersion: 1,
    minorVersion: 0,
    assistant: { __typename: 'AiEvalAssistant', id: '50', name: 'Second Assistant' },
  },
  insertedAt: '2026-02-01T00:00:00Z',
  updatedAt: '2026-02-01T01:00:00Z',
};

export const guardrailTraces = [
  {
    trace_id: 'item_0_0',
    question_id: 1,
    question: 'What is the definition of health, Himanshu?',
    ground_truth_answer: 'Health is complete well-being.',
    llm_answer: '',
    guardrail: 'blocked: PII detected in the text.',
    input_to_llm: null,
    output_from_llm: null,
    scores: [],
  },
  {
    trace_id: 'item_3_0',
    question_id: 2,
    question: 'What is the sequence of taxonomic categories?',
    ground_truth_answer: 'Species → Genus → Family → Order → Class → Phylum → Kingdom.',
    llm_answer: 'Species, Genus, Family, Order, Class, Phylum, Kingdom.',
    guardrail: 'applied',
    input_to_llm: 'What is the sequence of taxonomic categories?',
    output_from_llm: null,
    scores: [{ name: 'Adherence to Ground Truth', value: 5, comment: 'Exact sequence.' }],
  },
  {
    trace_id: 'item_4_0',
    question_id: 3,
    question: 'What is taxonomy?',
    ground_truth_answer: 'Naming and classifying organisms.',
    llm_answer: 'The science of naming and classifying organisms.',
    scores: [{ name: 'Adherence to Ground Truth', value: 4, comment: '' }],
  },
];
