import type { KnowledgeBaseFile } from './knowledgeBaseType';

export interface ModelParamSpec {
  description?: string;
  type?: string;
  min?: number;
  max?: number;
  default?: number | string;
  options?: string[];
}

export interface RawKaapiModel {
  modelName: string;
  provider?: string;
  completionType?: string[] | null;
  config?: string | null;
}

export interface KaapiModel {
  modelName: string;
  provider: string;
  config: Record<string, ModelParamSpec>;
}

export interface AssistantVectorStore {
  id: string;
  vectorStoreId: string;
  knowledgeBaseVersionId: string;
  name: string;
  legacy: boolean;
  size: number;
  files: Array<{ name: string; id: string; fileSize: number }>;
}

export interface AssistantVersion {
  id: string;
  versionNumber: number;
  model: string;
  prompt: string;
  settings: unknown;
  status: string;
  isLive: boolean;
  description?: string;
  insertedAt: string;
  updatedAt: string;
  vectorStore?: AssistantVectorStore | null;
}

export interface ModelConfig {
  model: string;
  temperature: string;
  effort: string;
  verbosity: string;
}

export interface EditorState {
  prompt: string;
  config: ModelConfig;
  files: KnowledgeBaseFile[];
}
