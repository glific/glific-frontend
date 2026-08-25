export type JsonRecord = Record<string, unknown>;

export type EvaluationSubTab = 'run' | 'history';

export type DuplicationFactor = 1 | 5;

export interface EvaluationMetrics {
  groundTruth: number | null;
  knowledgeBase: number | null;
  prompt: number | null;
}

export type ScoreBand = 'good' | 'okay' | 'bad';

export interface EvaluationTrace {
  questionId: string;
  question: string;
  expected: string;
  answer: string;
  scores: { name: string; value: number | null }[];
}

export interface EvaluationRun {
  id: string;
  name: string;
  status: string;
  failureReason?: string | null;
  results?: unknown;
  duplicationFactor?: number | null;
  goldenQa?: { id: string; name: string; duplicationFactor?: number | null } | null;
  assistantConfigVersion?: {
    id: string;
    versionNumber: number;
    assistant?: { id: string; name: string } | null;
  } | null;
  insertedAt: string;
  updatedAt?: string | null;
}
