import { CREATE_GOLDEN_QA } from 'graphql/mutations/AIEvaluations';
import { GET_ASSISTANT_CONFIG_VERSIONS } from 'graphql/queries/Assistant';

export const getDummyGetItemMock = (query: unknown) => ({
  request: { query },
  result: { data: { __typename: 'Query' } },
});

export const getDummyCreateMock = (query: unknown) => ({
  request: { query },
  result: { data: { __typename: 'Mutation' } },
});

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
        },
      ],
    },
  },
};

export const getAIEvaluationCreateMocks = (getItemQuery: unknown, createQuery: unknown) => [
  getDummyGetItemMock(getItemQuery),
  getDummyCreateMock(createQuery),
  getAssistantConfigVersionsMock,
];

export const createGoldenQaSuccessMock = {
  request: { query: CREATE_GOLDEN_QA },
  variableMatcher: () => true,
  result: {
    data: {
      createGoldenQa: {
        __typename: 'CreateGoldenQaPayload',
        goldenQa: { __typename: 'GoldenQa', name: 'golden_qa', duplication_factor: 1 },
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

export const createGoldenQaCustomSuccessMock = (name: string, duplicationFactor: number) => ({
  request: { query: CREATE_GOLDEN_QA },
  variableMatcher: () => true,
  result: {
    data: {
      createGoldenQa: {
        __typename: 'CreateGoldenQaPayload',
        goldenQa: { __typename: 'GoldenQa', name, duplication_factor: duplicationFactor },
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
