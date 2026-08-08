import type {
  KaapiModel,
  ModelConfig,
  ModelParamSpec,
  RawKaapiModel,
} from 'containers/AIEvaluation/types/assistantType';

/** used until kaapiModels resolves, and as the fallback when it returns nothing usable */
export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  model: '',
  temperature: '',
  effort: '',
  verbosity: '',
};

export const SUPPORTED_PARAMS = ['temperature', 'effort', 'verbosity'] as const;

const parseConfig = (config?: string | null): Record<string, ModelParamSpec> => {
  if (!config) return {};
  try {
    return JSON.parse(config);
  } catch {
    return {};
  }
};

/**
 * Embedding models come back with no completion type and an empty config; they are not
 * something an assistant can be pointed at, so they never reach the dropdown.
 */
export const parseKaapiModels = (models?: RawKaapiModel[] | null): KaapiModel[] =>
  (models ?? [])
    .filter((model) => (model.completionType ?? []).includes('text'))
    .map((model) => ({
      modelName: model.modelName,
      provider: model.provider ?? '',
      config: parseConfig(model.config),
    }));

export const getModel = (models: KaapiModel[], modelName: string): KaapiModel | undefined =>
  models.find((model) => model.modelName === modelName) ?? models[0];

/** the spec for one setting, or undefined when this model does not take it */
export const getParamSpec = (model: KaapiModel | undefined, param: string): ModelParamSpec | undefined => {
  if (!model || !(SUPPORTED_PARAMS as readonly string[]).includes(param)) return undefined;
  return model.config[param];
};

/** the model's own defaults, so switching models lands on values it actually accepts */
export const configForModel = (model: KaapiModel | undefined, current: ModelConfig): ModelConfig => {
  if (!model) return current;

  const temperature = model.config.temperature?.default;
  const effort = model.config.effort?.default;
  const verbosity = model.config.verbosity?.default;

  return {
    model: model.modelName,
    temperature: temperature != null ? String(temperature) : '',
    effort: effort != null ? String(effort) : '',
    verbosity: verbosity != null ? String(verbosity) : '',
  };
};
