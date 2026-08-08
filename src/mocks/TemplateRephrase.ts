import { REPHRASE_TEMPLATE_BODY } from 'graphql/mutations/TemplateRephrase';
import { TEMPLATE_REPHRASE } from 'graphql/queries/TemplateRephrase';

export const sampleBody = 'hey there, just checking in on your order';
export const rephrasedText = 'Hello, we are following up regarding your order.';

const rephraseTemplateBodyMock = (
  action: 'PROFESSIONAL' | 'UTILITY' | 'CUSTOM' = 'PROFESSIONAL',
  customPrompt: string | null = null,
  text: string = sampleBody
) => ({
  request: {
    query: REPHRASE_TEMPLATE_BODY,
    variables: { input: { text, action, customPrompt } },
  },
  result: {
    data: {
      rephraseTemplateBody: {
        templateRephrase: {
          id: '1',
          status: 'in_progress',
          rephrasedText: null,
          errorMessage: null,
        },
        errors: null,
      },
    },
  },
});

const templateRephraseInProgressMock = {
  request: {
    query: TEMPLATE_REPHRASE,
    variables: { id: '1' },
  },
  result: {
    data: {
      templateRephrase: {
        templateRephrase: {
          id: '1',
          status: 'in_progress',
          rephrasedText: null,
          errorMessage: null,
        },
        errors: null,
      },
    },
  },
};

const templateRephraseReadyMock = {
  request: {
    query: TEMPLATE_REPHRASE,
    variables: { id: '1' },
  },
  result: {
    data: {
      templateRephrase: {
        templateRephrase: {
          id: '1',
          status: 'ready',
          rephrasedText,
          errorMessage: null,
        },
        errors: null,
      },
    },
  },
};

const templateRephraseFailedMock = {
  request: {
    query: TEMPLATE_REPHRASE,
    variables: { id: '1' },
  },
  result: {
    data: {
      templateRephrase: {
        templateRephrase: {
          id: '1',
          status: 'failed',
          rephrasedText: null,
          errorMessage: 'Could not rephrase this message',
        },
        errors: null,
      },
    },
  },
};

const rephraseTemplateBodyErrorMock = (action: 'PROFESSIONAL' | 'UTILITY' | 'CUSTOM', customPrompt: string | null) => ({
  request: {
    query: REPHRASE_TEMPLATE_BODY,
    variables: { input: { text: sampleBody, action, customPrompt } },
  },
  error: new Error('AI Assist failed'),
});

export const aiAssistProfessionalSuccessMocks = [
  rephraseTemplateBodyMock('PROFESSIONAL', null),
  templateRephraseInProgressMock,
  templateRephraseReadyMock,
  templateRephraseReadyMock,
  templateRephraseReadyMock,
];

export const aiAssistUtilitySuccessMocks = [
  rephraseTemplateBodyMock('UTILITY', null),
  templateRephraseInProgressMock,
  templateRephraseReadyMock,
  templateRephraseReadyMock,
  templateRephraseReadyMock,
];

export const customPromptText = 'Make it sound more casual';

export const aiAssistCustomSuccessMocks = [
  rephraseTemplateBodyMock('CUSTOM', customPromptText),
  templateRephraseInProgressMock,
  templateRephraseReadyMock,
  templateRephraseReadyMock,
  templateRephraseReadyMock,
];

export const aiAssistErrorMocks = [rephraseTemplateBodyErrorMock('PROFESSIONAL', null)];

export const aiAssistPollFailedMocks = [
  rephraseTemplateBodyMock('PROFESSIONAL', null),
  templateRephraseInProgressMock,
  templateRephraseFailedMock,
  templateRephraseFailedMock,
];
