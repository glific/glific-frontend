import type {
  AssistantModel,
  ModelCategory,
  ModelConfig,
  ModelParamSpec,
  RawAssistantModel,
} from 'containers/AIEvaluation/types/assistantType';

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  model: '',
  temperature: '',
  effort: '',
};

const SUPPORTED_PARAMS = ['temperature', 'effort'] as const;

const parseConfig = (config?: string | null): Record<string, ModelParamSpec> => {
  if (!config) return {};
  try {
    return JSON.parse(config);
  } catch {
    return {};
  }
};

const CATEGORIES: ModelCategory[] = ['recommended', 'all', 'to_be_deprecated'];

export const CATEGORY_LABEL = {
  recommended: 'Recommended',
  all: 'All models',
  to_be_deprecated: 'To be deprecated',
} as const satisfies Record<ModelCategory, string>;

const asCategory = (category?: string | null): ModelCategory =>
  CATEGORIES.includes(category as ModelCategory) ? (category as ModelCategory) : 'all';

export const parseAssistantModels = (models?: RawAssistantModel[] | null): AssistantModel[] =>
  (models ?? [])
    .filter((model) => (model.completionType ?? []).includes('text'))
    .map((model) => ({
      modelName: model.modelName,
      provider: model.provider ?? '',
      config: parseConfig(model.config),
      badge: model.badge ?? null,
      category: asCategory(model.category),
    }));

export const groupModelsByCategory = (models: AssistantModel[]) =>
  CATEGORIES.map((category) => ({
    category,
    label: CATEGORY_LABEL[category],
    models: models.filter((model) => model.category === category),
  })).filter((group) => group.models.length > 0);

export const defaultModelName = (models: AssistantModel[]) =>
  models.find((model) => model.category === 'recommended')?.modelName ?? models[0]?.modelName ?? '';

export const getModel = (models: AssistantModel[], modelName: string): AssistantModel | undefined =>
  models.find((model) => model.modelName === modelName) ?? models[0];

export const getParamSpec = (model: AssistantModel | undefined, param: string): ModelParamSpec | undefined => {
  if (!model || !(SUPPORTED_PARAMS as readonly string[]).includes(param)) return undefined;
  return model.config[param];
};

export const configForModel = (model: AssistantModel | undefined, current: ModelConfig): ModelConfig => {
  if (!model) return current;

  const temperature = model.config.temperature?.default;
  const effort = model.config.effort?.default;

  return {
    model: model.modelName,
    temperature: temperature != null ? String(temperature) : '',
    effort: effort != null ? String(effort) : '',
  };
};
