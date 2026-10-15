import { GET_GUARDRAIL_VALIDATORS } from 'graphql/queries/Guardrails';

interface ValidatorMock {
  type: string;
  link: string | null;
  config?: unknown;
}

export const PII_REMOVER_CONFIG = {
  additionalProperties: false,
  $defs: {
    PIIEntityType: {
      title: 'PIIEntityType',
      enum: [
        'CREDIT_CARD',
        'EMAIL_ADDRESS',
        'IBAN_CODE',
        'IP_ADDRESS',
        'LOCATION',
        'MEDICAL_LICENSE',
        'NRP',
        'PERSON',
        'PHONE_NUMBER',
        'URL',
        'IN_AADHAAR',
        'IN_PAN',
        'IN_PASSPORT',
        'IN_VEHICLE_REGISTRATION',
        'IN_VOTER',
      ],
      type: 'string',
    },
    Stage: { title: 'Stage', enum: ['input', 'output'], type: 'string' },
  },
  properties: {
    entity_types: {
      items: { $ref: '#/$defs/PIIEntityType' },
      title: 'Entity Types',
      type: 'array',
      default: [
        'CREDIT_CARD',
        'EMAIL_ADDRESS',
        'IBAN_CODE',
        'IP_ADDRESS',
        'MEDICAL_LICENSE',
        'PHONE_NUMBER',
        'URL',
        'IN_AADHAAR',
        'IN_PAN',
        'IN_PASSPORT',
        'IN_VEHICLE_REGISTRATION',
        'IN_VOTER',
      ],
    },
    type: { title: 'Type', type: 'string', const: 'pii_remover' },
  },
  required: ['type'],
  title: 'PIIRemoverSafetyValidatorConfig',
  type: 'object',
};

export const ULI_SLUR_MATCH_CONFIG = {
  additionalProperties: false,
  $defs: { Stage: { title: 'Stage', enum: ['input', 'output'], type: 'string' } },
  properties: {
    languages: { items: { type: 'string' }, title: 'Languages', type: 'array', default: ['en', 'hi'] },
    severity: { title: 'Severity', enum: ['low', 'medium', 'high', 'all'], type: 'string', default: 'all' },
    type: { title: 'Type', type: 'string', const: 'uli_slur_match' },
  },
  required: ['type'],
  title: 'LexicalSlurSafetyValidatorConfig',
  type: 'object',
};

export const GENDER_ASSUMPTION_BIAS_CONFIG = {
  additionalProperties: false,
  $defs: {
    GuardrailOnFail: { title: 'GuardrailOnFail', enum: ['exception', 'fix', 'rephrase'], type: 'string' },
    BiasCategories: { title: 'BiasCategories', enum: ['generic', 'healthcare', 'education', 'all'], type: 'string' },
  },
  properties: {
    on_fail: { $ref: '#/$defs/GuardrailOnFail', default: 'fix' },
    categories: {
      anyOf: [{ items: { $ref: '#/$defs/BiasCategories' }, type: 'array' }, { type: 'null' }],
      title: 'Categories',
      default: ['all'],
    },
    type: { title: 'Type', type: 'string', const: 'gender_assumption_bias' },
  },
  required: ['type'],
  title: 'GenderAssumptionBiasSafetyValidatorConfig',
  type: 'object',
};

export const TOPIC_RELEVANCE_LLM_CONFIG = {
  additionalProperties: false,
  properties: {
    fallback_message: {
      anyOf: [{ minLength: 1, type: 'string' }, { type: 'null' }],
      title: 'Fallback Message',
      default: null,
    },
    threshold: { minimum: 1, title: 'Threshold', type: 'integer', maximum: 3, default: 2 },
    type: { title: 'Type', type: 'string', const: 'topic_relevance_llm' },
  },
  required: ['type'],
  title: 'TopicRelevanceLLMSafetyValidatorConfig',
  type: 'object',
};

const validator = ({ type, link, config }: ValidatorMock) => ({
  __typename: 'GuardrailValidator',
  type,
  link,
  config: JSON.stringify(config ?? { title: `${type} config`, type: 'object' }),
});

export const guardrailDocsLink = (slug: string) => `https://projecttech4devai.github.io/kaapi-docs/guardrails/${slug}`;

export const ALL_GUARDRAIL_VALIDATORS: ValidatorMock[] = [
  {
    type: 'gender_assumption_bias',
    link: guardrailDocsLink('gender-neutrality'),
    config: GENDER_ASSUMPTION_BIAS_CONFIG,
  },
  { type: 'pii_remover', link: guardrailDocsLink('privacy-protection'), config: PII_REMOVER_CONFIG },
  { type: 'uli_slur_match', link: guardrailDocsLink('content-safety'), config: ULI_SLUR_MATCH_CONFIG },
  { type: 'topic_relevance_llm', link: guardrailDocsLink('scope-control'), config: TOPIC_RELEVANCE_LLM_CONFIG },
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
