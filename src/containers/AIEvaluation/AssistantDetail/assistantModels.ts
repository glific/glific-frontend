import type {
  AssistantModel,
  ModelConfig,
  ModelParams,
  ReasoningEffort,
  Verbosity,
} from 'containers/AIEvaluation/types/assistantType';
import type { resources } from 'i18n/config';

type TranslationKey = keyof (typeof resources)['en']['translation'];

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  model: 'gpt-4.1',
  temperature: '0.01',
  effort: 'medium',
  verbosity: 'medium',
};

/**
 * The single place models are declared. To add one, append an entry here — the Persona &
 * Prompt tab reads its settings straight off this list.
 */
export const ASSISTANT_MODELS: AssistantModel[] = [
  {
    id: 'gpt-4.1',
    label: 'GPT-4.1',
    kind: 'standard',
    blurb: 'Reliable general-purpose model. Good default for most assistants.',
  },
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    kind: 'standard',
    blurb: 'Fast and multimodal. Good when latency matters.',
  },
  {
    id: 'gpt-5-chat',
    label: 'GPT-5 Chat',
    kind: 'standard',
    blurb: 'The non-reasoning GPT-5 variant. Behaves like a normal chat model.',
  },
  {
    id: 'gpt-5',
    label: 'GPT-5',
    kind: 'reasoning',
    efforts: ['minimal', 'low', 'medium', 'high'],
    defaultEffort: 'medium',
    blurb: 'Reasoning model. Thinks before answering — better on tricky questions, slower and pricier.',
  },
  {
    id: 'gpt-5-mini',
    label: 'GPT-5 mini',
    kind: 'reasoning',
    efforts: ['minimal', 'low', 'medium', 'high'],
    defaultEffort: 'medium',
    blurb: 'Smaller reasoning model. Cheaper than GPT-5 with most of the benefit.',
  },
  {
    id: 'gpt-5.1',
    label: 'GPT-5.1',
    kind: 'reasoning',
    efforts: ['none', 'low', 'medium', 'high'],
    defaultEffort: 'none',
    temperatureWhenEffortNone: true,
    blurb: 'Reasoning defaults to "none", which makes it behave like a chat model until you turn reasoning up.',
  },
  {
    id: 'o4-mini',
    label: 'o4-mini',
    kind: 'reasoning',
    efforts: ['low', 'medium', 'high'],
    defaultEffort: 'medium',
    blurb: 'Compact reasoning model. Strong at structured tasks.',
  },
];

export const VERBOSITY_OPTIONS: Verbosity[] = ['low', 'medium', 'high'];

export const TEMPERATURE_MIN = 0;
export const TEMPERATURE_MAX = 2;

export const EFFORT_HINTS: Record<ReasoningEffort, TranslationKey> = {
  none: 'Reasoning is off — this model behaves like a standard chat model.',
  minimal: 'Barely thinks first. Fastest and cheapest of the reasoning settings.',
  low: 'A little thinking. Good balance for simple questions.',
  medium: 'Balanced thinking. A reasonable default.',
  high: 'Thinks hardest. Best on tricky questions, but slowest and most expensive per reply.',
};

export const getModel = (id: string): AssistantModel =>
  ASSISTANT_MODELS.find((entry) => entry.id === id) ?? ASSISTANT_MODELS[0];

export const getModelParams = (config: ModelConfig): ModelParams => {
  const selected = getModel(config.model);

  if (selected.kind === 'standard') {
    return { temperature: true, effort: false, verbosity: false };
  }

  const reasoningOff = Boolean(selected.temperatureWhenEffortNone) && config.effort === 'none';
  return { temperature: reasoningOff, effort: true, verbosity: true };
};
