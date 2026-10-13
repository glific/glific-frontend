import { GET_GUARDRAIL_VALIDATORS } from 'graphql/queries/Guardrails';

interface ValidatorMock {
  type: string;
  link: string | null;
}

const validator = ({ type, link }: ValidatorMock) => ({
  __typename: 'GuardrailValidator',
  type,
  link,
  config: JSON.stringify({ title: `${type} config`, type: 'object' }),
});

export const guardrailDocsLink = (slug: string) => `https://projecttech4devai.github.io/kaapi-docs/guardrails/${slug}`;

export const ALL_GUARDRAIL_VALIDATORS: ValidatorMock[] = [
  { type: 'gender_assumption_bias', link: guardrailDocsLink('gender-neutrality') },
  { type: 'pii_remover', link: guardrailDocsLink('privacy-protection') },
  { type: 'profanity_free', link: guardrailDocsLink('content-safety') },
  { type: 'topic_relevance_llm', link: guardrailDocsLink('scope-control') },
];

export const getGuardrailValidatorsMock = (validators: ValidatorMock[] = ALL_GUARDRAIL_VALIDATORS) => ({
  request: { query: GET_GUARDRAIL_VALIDATORS },
  result: {
    data: {
      guardrailValidators: {
        __typename: 'GuardrailValidatorsResult',
        validators: validators.map(validator),
      },
    },
  },
});

export const getGuardrailValidatorsErrorMock = {
  request: { query: GET_GUARDRAIL_VALIDATORS },
  error: new Error('Could not reach the guardrails service'),
};
