import type {
  GuardrailAction,
  GuardrailRule,
  GuardrailStage,
  GuardrailTier,
  GuardrailValidator,
} from 'containers/AIEvaluation/types/guardrailType';

export const GUARDRAIL_ACTION_LABEL = {
  fix: 'Fixes & passes on',
  block: 'Blocks — sends set reply',
} as const satisfies Record<GuardrailAction, string>;

export const GUARDRAIL_STAGE_COPY = {
  incoming: {
    title: 'Guardrails on incoming messages',
    note: 'Run before a message reaches the assistant · changes are saved with your next version',
  },
  reply: {
    title: 'Guardrails on assistant replies',
    note: 'Run before a reply is sent back to the beneficiary',
  },
} as const satisfies Record<GuardrailStage, { title: string; note: string }>;

export const GUARDRAIL_TIER_LABEL = {
  recommended: 'Recommended',
  additional: 'Additional',
} as const satisfies Record<GuardrailTier, string>;

const GUARDRAIL_PRESENTATION: Omit<GuardrailRule, 'link'>[] = [
  {
    id: 'privacy-protection',
    type: 'pii_remover',
    stage: 'incoming',
    tier: 'recommended',
    title: 'Privacy Protection',
    description: 'Hides personal details like phone numbers, addresses and ID numbers, so they are not saved or shown.',
    action: 'fix',
    enabled: false,
    control: {
      kind: 'detailTypes',
      groups: [
        {
          id: 'general',
          label: 'General details',
          options: [
            { id: 'name', label: 'Name', selected: true },
            { id: 'phone', label: 'Phone number', selected: true },
            { id: 'email', label: 'Email address', selected: true },
            { id: 'location', label: 'Location / address', selected: true },
            { id: 'web-link', label: 'Web link', selected: true },
            { id: 'credit-card', label: 'Credit card number', selected: true },
            { id: 'ip-address', label: 'IP address', selected: true },
            { id: 'bank-account', label: 'Bank account (IBAN)', selected: true },
            { id: 'medical-license', label: 'Medical license number', selected: true },
            { id: 'affiliation', label: 'Nationality / religious / political group', selected: true },
          ],
        },
        {
          id: 'indian-ids',
          label: 'Indian government IDs',
          options: [
            { id: 'aadhaar', label: 'Aadhaar number', selected: true },
            { id: 'pan', label: 'PAN card number', selected: true },
            { id: 'passport', label: 'Passport number', selected: true },
            { id: 'voter-id', label: 'Voter ID number', selected: true },
            { id: 'vehicle-registration', label: 'Vehicle registration number', selected: true },
          ],
        },
      ],
    },
  },
  {
    id: 'content-safety',
    type: 'profanity_free',
    stage: 'incoming',
    tier: 'recommended',
    title: 'Content Safety',
    description: 'Removes abusive or hurtful words from messages.',
    action: 'fix',
    enabled: false,
    control: { kind: 'none' },
  },
  {
    id: 'scope-control',
    type: 'topic_relevance_llm',
    stage: 'incoming',
    tier: 'recommended',
    title: 'Scope Control',
    description: "The assistant won't answer questions about the topics you list here.",
    action: 'block',
    enabled: false,
    control: {
      kind: 'topics',
      disallowedTopics: [],
      suggestedTopics: [
        {
          id: 'suggest-politics-religion',
          label: 'Politics & Religion',
          description:
            'elections, political parties, candidates, religious debates, proselytizing, doctrinal questions',
        },
        {
          id: 'suggest-relationship-advice',
          label: 'Personal relationship advice',
          description: 'dating, marriage counselling, family disputes',
        },
        {
          id: 'suggest-legal-financial-advice',
          label: 'Legal & financial advice',
          description: 'legal proceedings, investment advice, loans, tax filing',
        },
        {
          id: 'suggest-medical-treatment-claims',
          label: 'Medical treatment claims',
          description: 'dosage, prescription, homeopathy, unproven remedies, drug combinations',
        },
      ],
      setReply: '',
    },
  },
  {
    id: 'gender-neutrality',
    type: 'gender_assumption_bias',
    stage: 'reply',
    tier: 'additional',
    title: 'Gender Neutrality',
    description:
      "Changes words that guess someone's gender, using words that work for any gender in Hindi and English.",
    action: 'fix',
    enabled: false,
    control: { kind: 'none' },
  },
];

export const buildGuardrailRules = (validators: GuardrailValidator[]): GuardrailRule[] =>
  GUARDRAIL_PRESENTATION.flatMap((rule) => {
    const validator = validators.find((entry) => entry.type === rule.type);
    return validator ? [{ ...rule, link: validator.link }] : [];
  });
