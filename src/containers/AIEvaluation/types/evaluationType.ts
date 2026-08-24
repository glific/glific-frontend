export type EvaluationSubTab = 'run' | 'history';

export type DuplicationFactor = 1 | 5;

export interface EvaluationMetrics {
  groundTruth: number | null;
  knowledgeBase: number | null;
  prompt: number | null;
}

export type ScoreBand = 'good' | 'okay' | 'bad';

export type EvaluationScoresFormat = 'row' | 'grouped';

export interface EvaluationTraceAnswer {
  answer: string;
  scores: { name: string; value: number | null }[];
}

export interface EvaluationTrace {
  questionId: string;
  question: string;
  expected: string;
  /** one entry per attempt — grouped runs repeat a question, row runs answer it once */
  answers: EvaluationTraceAnswer[];
}

/** shape of the cached `aiEvaluations` list, as the subscription folds updates into it */
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
    versionNumber: number;
    assistant?: { id: string; name: string } | null;
  } | null;
  insertedAt: string;
  updatedAt?: string | null;
}
