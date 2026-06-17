import { GENERATE_PROMPT } from 'graphql/mutations/PromptGenerator';
import { PROMPT_GENERATION } from 'graphql/queries/PromptGenerator';

export const sampleAnswers = {
  name: '',
  purpose: '',
  audience: '',
  language: '',
  tone: '',
  format: '',
  offLimits: '',
  fallback: '',
  escalation: '',
};

export const generatedPromptText = 'You are a helpful WhatsApp assistant...';

const generatePromptMock = (input: typeof sampleAnswers = sampleAnswers) => ({
  request: {
    query: GENERATE_PROMPT,
    variables: { input },
  },
  result: {
    data: {
      generatePrompt: {
        promptGeneration: {
          id: '1',
          status: 'in_progress',
          generatedPrompt: null,
          errorMessage: null,
        },
        errors: null,
      },
    },
  },
});

const promptGenerationInProgressMock = {
  request: {
    query: PROMPT_GENERATION,
    variables: { id: '1' },
  },
  result: {
    data: {
      promptGeneration: {
        promptGeneration: {
          id: '1',
          status: 'in_progress',
          generatedPrompt: null,
          errorMessage: null,
        },
        errors: null,
      },
    },
  },
};

const promptGenerationReadyMock = {
  request: {
    query: PROMPT_GENERATION,
    variables: { id: '1' },
  },
  result: {
    data: {
      promptGeneration: {
        promptGeneration: {
          id: '1',
          status: 'ready',
          generatedPrompt: generatedPromptText,
          errorMessage: null,
        },
        errors: null,
      },
    },
  },
};

const generatePromptErrorMock = {
  request: {
    query: GENERATE_PROMPT,
    variables: { input: sampleAnswers },
  },
  error: new Error('Prompt generation failed'),
};

const generatePromptFailedStatusMock = {
  request: {
    query: GENERATE_PROMPT,
    variables: { input: sampleAnswers },
  },
  result: {
    data: {
      generatePrompt: {
        promptGeneration: {
          id: '2',
          status: 'failed',
          generatedPrompt: null,
          errorMessage: 'Could not generate prompt',
        },
        errors: null,
      },
    },
  },
};

// success path: mutation -> in_progress poll -> ready poll.
// Extra ready mocks act as a buffer in case an additional poll tick fires
// before stopPolling takes effect.
export const promptGeneratorSuccessMocks = [
  generatePromptMock(),
  promptGenerationInProgressMock,
  promptGenerationReadyMock,
  promptGenerationReadyMock,
  promptGenerationReadyMock,
];

// network error path on the mutation
export const promptGeneratorErrorMocks = [generatePromptErrorMock];

// failed status returned directly from the mutation
export const promptGeneratorFailedStatusMocks = [generatePromptFailedStatusMock];
