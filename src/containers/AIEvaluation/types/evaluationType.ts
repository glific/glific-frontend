export type EvaluationSubTab = 'run' | 'history';

export type DuplicationFactor = 1 | 5;

export interface EvaluationMetrics {
  groundTruth: number | null;
  knowledgeBase: number | null;
  prompt: number | null;
}

export interface EvaluationRun {
  id: string;
  name: string;
  status: string;
  failureReason?: string | null;
  results?: unknown;
  goldenQa?: { id: string; name: string; duplicationFactor?: number | null } | null;
  assistantConfigVersion?: { id: string; versionNumber: number } | null;
  insertedAt: string;
  updatedAt?: string | null;
}
