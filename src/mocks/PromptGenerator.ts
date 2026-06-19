import { GENERATE_PROMPT } from 'graphql/mutations/PromptGenerator';
import { PROMPT_GENERATION } from 'graphql/queries/PromptGenerator';

// All fields are mandatory, so the mocked mutation variables use filled answers.
// Tests fill the 9 textareas with these exact values (in question order) so the
// MockedProvider variable match succeeds.
export const sampleAnswers = {
  name: 'SNEHA DIDI by SNEHA',
  purpose: 'Answers maternal and child health queries',
  audience: 'New and expecting mothers, low literacy',
  language: 'Hindi and English',
  tone: 'Simple and friendly',
  format: 'Short messages, max 3 sentences',
  offLimits: 'No medical diagnosis',
  fallback: 'Sorry, please contact our helpline',
  escalation: 'Reply AGENT to reach staff',
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

const promptGenerationFailedMock = {
  request: {
    query: PROMPT_GENERATION,
    variables: { id: '1' },
  },
  result: {
    data: {
      promptGeneration: {
        promptGeneration: {
          id: '1',
          status: 'failed',
          generatedPrompt: null,
          errorMessage: 'Kaapi could not generate a prompt',
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

// mutation accepted (in_progress) but polling then resolves to a failed status
export const promptGeneratorPollFailedMocks = [
  generatePromptMock(),
  promptGenerationInProgressMock,
  promptGenerationFailedMock,
  promptGenerationFailedMock,
];
