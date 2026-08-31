export type JsonRecord = Record<string, unknown>;

export type EvaluationSubTab = 'run' | 'history';

export type DuplicationFactor = 1 | 5;

export interface EvaluationMetrics {
  groundTruth: number | null;
  knowledgeBase: number | null;
  prompt: number | null;
}

export type ScoreBand = 'good' | 'okay' | 'bad';

export type EvaluationScoresFormat = 'row' | 'grouped';

export interface EvaluationTraceScore {
  name: string;
  value: number | null;
  comment: string;
}

export interface EvaluationTraceAnswer {
  answer: string;
  scores: EvaluationTraceScore[];
}

export interface EvaluationTrace {
  questionId: string;
  question: string;
  expected: string;
  answers: EvaluationTraceAnswer[];
}

export interface EvaluationListData {
  aiEvaluations?: EvaluationRun[];
}

export interface EvaluationRun {
  id: string;
  name: string;
  status: string;
  failureReason?: string | null;
  results?: unknown;
  duplicationFactor?: DuplicationFactor;
  goldenQa?: { id: string; name: string; duplicationFactor?: DuplicationFactor | null } | null;
  assistantConfigVersion?: {
    id: string;
    majorVersion: number;
    minorVersion: number;
    assistant?: { id: string; name: string } | null;
  } | null;
  insertedAt: string;
  updatedAt?: string | null;
}
