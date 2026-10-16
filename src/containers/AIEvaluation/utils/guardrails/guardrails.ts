import type {
  GuardrailAction,
  GuardrailControl,
  GuardrailDetailGroup,
  GuardrailDetailOption,
  GuardrailRule,
  GuardrailSpec,
  GuardrailSpecs,
  GuardrailStage,
  GuardrailTier,
  GuardrailTopic,
  GuardrailTopicSuggestion,
  GuardrailValidator,
} from 'containers/AIEvaluation/types/guardrailType';

export const GUARDRAIL_ACTION_LABEL = {
  fix: 'Fixes & passes on',
  block: 'Blocks — sends set reply',
} as const satisfies Record<GuardrailAction, string>;

const BLOCKING_ON_FAIL = ['exception', 'rephrase'];

const MODEL_GUESSED_ENTITIES = ['PERSON', 'LOCATION', 'NRP'];

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

const GUARDRAIL_PRESENTATION: Omit<GuardrailRule, 'link' | 'action'>[] = [
  {
    id: 'privacy-protection',
    type: 'pii_remover',
    stage: 'incoming',
    tier: 'recommended',
    title: 'Privacy Protection',
    description: 'Hides personal details like phone numbers, addresses and ID numbers, so they are not saved or shown.',
    enabled: false,
    control: { kind: 'detailTypes', groups: [] },
  },
  {
    id: 'content-safety',
    type: 'uli_slur_match',
    stage: 'incoming',
    tier: 'recommended',
    title: 'Content Safety',
    description: 'Removes abusive or hurtful words from messages.',
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
    enabled: false,
    control: { kind: 'none' },
  },
];

const PII_ENTITY_LABEL: Record<string, string> = {
  PERSON: 'Name',
  PHONE_NUMBER: 'Phone number',
  EMAIL_ADDRESS: 'Email address',
  LOCATION: 'Location / address',
  URL: 'Web link',
  CREDIT_CARD: 'Credit card number',
  IP_ADDRESS: 'IP address',
  IBAN_CODE: 'Bank account (IBAN)',
  MEDICAL_LICENSE: 'Medical license number',
  NRP: 'Nationality / religious / political group',
  IN_AADHAAR: 'Aadhaar number',
  IN_PAN: 'PAN card number',
  IN_PASSPORT: 'Passport number',
  IN_VOTER: 'Voter ID number',
  IN_VEHICLE_REGISTRATION: 'Vehicle registration number',
};

const humanize = (code: string) =>
  code
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');

type JsonObject = Record<string, unknown>;

const asObject = (value: unknown): JsonObject | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonObject) : null;

const stringsIn = (value: unknown) =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : null;

export const parseJson = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const readSchema = (config: unknown): JsonObject | null => asObject(parseJson(config));

/**
 * A config property, with a nullable `anyOf: [X, { type: "null" }]` unwrapped to X — keeping the
 * property's own title and default, which sit outside the `anyOf`.
 */
const propertyOf = (schema: JsonObject | null, name: string): JsonObject | null => {
  const property = asObject(asObject(schema?.properties)?.[name]);
  const variants = Array.isArray(property?.anyOf) ? property.anyOf.map(asObject) : [];
  const inner = variants.find((variant) => variant && variant.type !== 'null');
  return inner ? { ...inner, ...property } : property;
};

/**
 * The values a property may take. The enum sits on the property, on its array `items`, or behind
 * a `"#/$defs/…"` reference from either.
 */
const enumOf = (schema: JsonObject | null, name: string): string[] => {
  const property = propertyOf(schema, name);
  const source = asObject(property?.items) ?? property;
  const ref = typeof source?.$ref === 'string' ? source.$ref.split('/').pop() : undefined;
  return stringsIn(source?.enum) ?? stringsIn(asObject(asObject(schema?.$defs)?.[ref ?? ''])?.enum) ?? [];
};

const selectedFirst = (options: GuardrailDetailOption[]) => [
  ...options.filter((option) => option.selected),
  ...options.filter((option) => !option.selected),
];

export const piiDetailGroups = (config: unknown): GuardrailDetailGroup[] => {
  const schema = readSchema(config);
  const codes = enumOf(schema, 'entity_types');
  if (codes.length === 0) return [];

  const defaults = stringsIn(propertyOf(schema, 'entity_types')?.default);
  const options: GuardrailDetailOption[] = codes.map((code) => ({
    id: code,
    label: PII_ENTITY_LABEL[code] ?? humanize(code),
    selected: defaults ? defaults.includes(code) : true,
  }));

  const guessed = (option: GuardrailDetailOption) => MODEL_GUESSED_ENTITIES.includes(option.id);
  const groups: GuardrailDetailGroup[] = [
    { id: 'pattern-matched', options: selectedFirst(options.filter((option) => !guessed(option))) },
    {
      id: 'model-guessed',
      note: 'Redacted using English model: misses many Indian names and sometimes masks ordinary words',
      options: selectedFirst(options.filter(guessed)),
    },
  ];
  return groups.filter((group) => group.options.length > 0);
};

export const actionFromConfig = (config: unknown): GuardrailAction => {
  const onFail = propertyOf(readSchema(config), 'on_fail')?.default;
  return typeof onFail === 'string' && BLOCKING_ON_FAIL.includes(onFail) ? 'block' : 'fix';
};

export const scopeFallbackMessage = (config: unknown) => {
  const fallback = propertyOf(readSchema(config), 'fallback_message')?.default;
  return typeof fallback === 'string' ? fallback : '';
};

const controlFromConfig = (control: GuardrailControl, config: unknown): GuardrailControl => {
  if (control.kind === 'detailTypes') return { kind: 'detailTypes', groups: piiDetailGroups(config) };
  if (control.kind === 'topics') return { ...control, setReply: scopeFallbackMessage(config) };
  return control;
};

export const safeLink = (link: string | null): string | null => {
  if (!link) return null;
  try {
    const { protocol } = new URL(link);
    return protocol === 'https:' || protocol === 'http:' ? link : null;
  } catch {
    return null;
  }
};

export const buildGuardrailRules = (validators: GuardrailValidator[]): GuardrailRule[] =>
  GUARDRAIL_PRESENTATION.flatMap((rule) => {
    const validator = validators.find((entry) => entry.type === rule.type);
    if (!validator) return [];

    return [
      {
        ...rule,
        link: safeLink(validator.link),
        action: actionFromConfig(validator.config),
        control: controlFromConfig(rule.control, validator.config),
      },
    ];
  });

export const EMPTY_GUARDRAIL_SPECS: GuardrailSpecs = { input: [], output: [] };

export const parseGuardrailSpecs = (value: unknown): GuardrailSpec[] => {
  const list = parseJson(value);
  if (!Array.isArray(list)) return [];
  return list.filter((entry): entry is GuardrailSpec => {
    const type = asObject(entry)?.type;
    return typeof type === 'string' && type !== '';
  });
};

export const slugify = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const TOPIC_DESCRIPTION_SEPARATOR = ' — ';

export const topicsToConfiguration = (topics: GuardrailTopic[]) =>
  topics
    .map((topic) =>
      topic.description ? `${topic.label}${TOPIC_DESCRIPTION_SEPARATOR}${topic.description}` : topic.label
    )
    .join('\n');

export const topicsFromConfiguration = (
  configuration: unknown,
  suggestions: GuardrailTopicSuggestion[]
): GuardrailTopic[] => {
  if (typeof configuration !== 'string') return [];

  return configuration
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [label, ...rest] = line.split(TOPIC_DESCRIPTION_SEPARATOR);
      const suggestion = suggestions.find((entry) => entry.label.toLowerCase() === label.toLowerCase());
      return {
        id: suggestion ? `topic-${suggestion.id}` : `custom-${slugify(label)}-${index}`,
        label,
        description: rest.join(TOPIC_DESCRIPTION_SEPARATOR),
      };
    });
};

const specListFor = (stage: GuardrailStage): keyof GuardrailSpecs => (stage === 'incoming' ? 'input' : 'output');

const EDITED_PARAMS = ['entity_types', 'configuration', 'fallback_message'];

const paramsFromControl = (control: GuardrailControl): Record<string, unknown> => {
  if (control.kind === 'detailTypes' && control.groups.length > 0) {
    return {
      entity_types: control.groups.flatMap((group) =>
        group.options.filter((option) => option.selected).map((option) => option.id)
      ),
    };
  }

  if (control.kind === 'topics') {
    const configuration = topicsToConfiguration(control.disallowedTopics);
    return {
      ...(configuration ? { configuration } : {}),
      ...(control.setReply.trim() ? { fallback_message: control.setReply } : {}),
    };
  }

  return {};
};

export const buildSavedGuardrails = (rules: GuardrailRule[], previous: GuardrailSpecs): GuardrailSpecs => {
  const shownTypes = new Set<string>(rules.map((rule) => rule.type));

  const specsFor = (list: keyof GuardrailSpecs): GuardrailSpec[] => [
    ...rules
      .filter((rule) => rule.enabled && specListFor(rule.stage) === list)
      .map((rule) => {
        const saved = previous[list].find((spec) => spec.type === rule.type) ?? {};
        const kept = Object.fromEntries(Object.entries(saved).filter(([key]) => !EDITED_PARAMS.includes(key)));
        return { ...kept, type: rule.type, ...paramsFromControl(rule.control) };
      }),
    ...previous[list].filter((spec) => !shownTypes.has(spec.type)),
  ];

  return { input: specsFor('input'), output: specsFor('output') };
};

const controlWithSpec = (control: GuardrailControl, spec: GuardrailSpec): GuardrailControl => {
  if (control.kind === 'detailTypes') {
    const chosen = stringsIn(spec.entity_types);
    if (!chosen) return control;
    return {
      kind: 'detailTypes',
      groups: control.groups.map((group) => ({
        ...group,
        options: selectedFirst(group.options.map((option) => ({ ...option, selected: chosen.includes(option.id) }))),
      })),
    };
  }

  if (control.kind === 'topics') {
    return {
      ...control,
      disallowedTopics: topicsFromConfiguration(spec.configuration, control.suggestedTopics),
      setReply: typeof spec.fallback_message === 'string' ? spec.fallback_message : control.setReply,
    };
  }

  return control;
};

export const rulesWithSpecs = (rules: GuardrailRule[], specs: GuardrailSpecs): GuardrailRule[] =>
  rules.map((rule) => {
    const spec = specs[specListFor(rule.stage)].find((entry) => entry.type === rule.type);
    return spec ? { ...rule, enabled: true, control: controlWithSpec(rule.control, spec) } : rule;
  });
