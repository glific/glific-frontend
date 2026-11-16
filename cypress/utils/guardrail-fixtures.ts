import { VERSIONS } from './assistant-fixtures';

export const GUARDRAIL_SERVICES = { aiGuardrailEnabled: true };

const guardrailDocsLink = (slug: string) =>
  `https://projecttech4devai.github.io/kaapi-docs/guardrails/${slug}`;

const PII_ENTITY_TYPES = [
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
];

// the kaapi defaults leave out the three entities the English model has to guess at
export const PII_DEFAULT_ENTITY_TYPES = PII_ENTITY_TYPES.filter(
  (entity) => !['LOCATION', 'NRP', 'PERSON'].includes(entity)
);

const ON_FAIL_DEFS = {
  GuardrailOnFail: {
    title: 'GuardrailOnFail',
    enum: ['exception', 'fix', 'rephrase'],
    type: 'string',
  },
};

const NULLABLE_FALLBACK = {
  anyOf: [{ minLength: 1, type: 'string' }, { type: 'null' }],
  title: 'Fallback Message',
  default: null,
};

const guardrailValidator = (type: string, slug: string, config: object) => ({
  __typename: 'GuardrailValidator',
  type,
  link: guardrailDocsLink(slug),
  config: JSON.stringify(config),
});

export const GUARDRAIL_VALIDATORS = [
  guardrailValidator('pii_remover', 'privacy-protection', {
    $defs: { PIIEntityType: { enum: PII_ENTITY_TYPES, type: 'string' } },
    properties: {
      entity_types: {
        items: { $ref: '#/$defs/PIIEntityType' },
        type: 'array',
        default: PII_DEFAULT_ENTITY_TYPES,
      },
      type: { const: 'pii_remover' },
    },
  }),
  guardrailValidator('content_safety', 'content-safety', {
    $defs: ON_FAIL_DEFS,
    properties: {
      on_fail: { $ref: '#/$defs/GuardrailOnFail', default: 'fix' },
      threshold: { type: 'number', default: 0.5 },
      fallback_message: NULLABLE_FALLBACK,
      type: { const: 'content_safety' },
    },
  }),
  guardrailValidator('topic_relevance_llm', 'scope-control', {
    properties: {
      fallback_message: NULLABLE_FALLBACK,
      threshold: { type: 'integer', default: 2 },
      type: { const: 'topic_relevance_llm' },
    },
  }),
  guardrailValidator('gender_assumption_bias', 'gender-neutrality', {
    $defs: ON_FAIL_DEFS,
    properties: {
      on_fail: { $ref: '#/$defs/GuardrailOnFail', default: 'fix' },
      type: { const: 'gender_assumption_bias' },
    },
  }),
];

export type GuardrailValidatorFixture = (typeof GUARDRAIL_VALIDATORS)[number];

export const CONTENT_SAFETY_REPLY =
  "Please avoid using hurtful or abusive words. Let's keep our chat kind and respectful.";
export const SCOPE_CONTROL_REPLY = 'I can only help with questions about antenatal care.';
export const POLITICS_TOPIC =
  'Politics & Religion — elections, political parties, candidates, religious debates, proselytizing, doctrinal questions';

// a live version saved with guardrails on, plus one kaapi validator this tab does not show
export const GUARDED_VERSIONS = [
  {
    ...VERSIONS[0],
    inputGuardrails: JSON.stringify([
      { type: 'content_safety', on_fail: 'rephrase', fallback_message: CONTENT_SAFETY_REPLY },
      {
        type: 'topic_relevance_llm',
        configuration: POLITICS_TOPIC,
        fallback_message: SCOPE_CONTROL_REPLY,
      },
      { type: 'ban_list', banned_words: ['scam'] },
    ]),
    outputGuardrails: JSON.stringify([{ type: 'gender_assumption_bias' }]),
  },
  VERSIONS[1],
];
