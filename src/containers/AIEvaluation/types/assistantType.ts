import type { resources } from 'i18n/config';
import type { KnowledgeBaseFile } from './knowledgeBaseType';

type TranslationKey = keyof (typeof resources)['en']['translation'];

export type ModelKind = 'standard' | 'reasoning';
export type ReasoningEffort = 'none' | 'minimal' | 'low' | 'medium' | 'high';
export type Verbosity = 'low' | 'medium' | 'high';

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

export interface AssistantModel {
  id: string;
  label: string;
  kind: ModelKind;
  blurb: TranslationKey;
  efforts?: ReasoningEffort[];
  defaultEffort?: ReasoningEffort;
  temperatureWhenEffortNone?: boolean;
}

export interface ModelConfig {
  model: string;
  temperature: string;
  effort: ReasoningEffort;
  verbosity: Verbosity;
}

export interface ModelParams {
  temperature: boolean;
  effort: boolean;
  verbosity: boolean;
}

export interface EditorState {
  prompt: string;
  config: ModelConfig;
  files: KnowledgeBaseFile[];
}
