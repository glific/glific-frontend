import type {
  EvaluationMetrics,
  EvaluationRun,
  EvaluationTrace,
  ScoreBand,
} from 'containers/AIEvaluation/types/evaluationType';

export const MAX_SCORE = 5;

export const METRIC_WEIGHTS = { groundTruth: 0.5, knowledgeBase: 0.3, prompt: 0.2 };

const METRIC_MATCHERS: { key: keyof EvaluationMetrics; matches: (name: string) => boolean }[] = [
  { key: 'groundTruth', matches: (name) => name.includes('ground') && name.includes('truth') },
  { key: 'knowledgeBase', matches: (name) => name.includes('knowledge') },
  { key: 'prompt', matches: (name) => name.includes('prompt') },
];

const EMPTY_METRICS: EvaluationMetrics = { groundTruth: null, knowledgeBase: null, prompt: null };

const asScore = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : null);

/**
 * `results` is a JSON string containing `summary_scores`, with one average score per applicable metric named in plain language; metrics that don’t apply to a run are omitted.
 */
export const parseEvaluationResults = (results: unknown): EvaluationMetrics => {
  let parsed: any = results;
  if (typeof results === 'string') {
    try {
      parsed = JSON.parse(results);
    } catch {
      return EMPTY_METRICS;
    }
  }

  if (!parsed || typeof parsed !== 'object') return EMPTY_METRICS;

  const metrics: EvaluationMetrics = { ...EMPTY_METRICS };

  const summary = parsed.summary_scores ?? parsed.summaryScores;
  if (Array.isArray(summary)) {
    summary.forEach((entry: any) => {
      const name = String(entry?.name ?? '').toLowerCase();
      const matched = METRIC_MATCHERS.find((matcher) => matcher.matches(name));
      if (matched) metrics[matched.key] = asScore(entry?.avg ?? entry?.average ?? entry?.score);
    });
    return metrics;
  }

  // a flatter shape, in case the judge ever reports one
  const read = (...keys: string[]) => {
    for (const key of keys) {
      const value = asScore(parsed[key]);
      if (value != null) return value;
    }
    return null;
  };

  return {
    groundTruth: read('groundTruth', 'ground_truth', 'adherence_to_ground_truth'),
    knowledgeBase: read('knowledgeBase', 'knowledge_base', 'adherence_to_knowledge_base'),
    prompt: read('prompt', 'adherence_to_prompt'),
  };
};

/**
 * `overall_score` is a weighted average of the metrics actually scored, with weights re-normalised for the metrics present; it is null only when no metrics were scored.
 */
export const overallScore = (metrics: EvaluationMetrics) => {
  const scored = (Object.keys(METRIC_WEIGHTS) as (keyof EvaluationMetrics)[]).filter((key) => metrics[key] != null);
  if (scored.length === 0) return null;

  const totalWeight = scored.reduce((sum, key) => sum + METRIC_WEIGHTS[key], 0);
  const weighted = scored.reduce((sum, key) => sum + (metrics[key] as number) * METRIC_WEIGHTS[key], 0);

  return Math.round((weighted / totalWeight) * 100) / 100;
};

export const scoreBand = (score: number): ScoreBand => {
  if (score >= 4) return 'good';
  if (score >= 2) return 'okay';
  return 'bad';
};

export const formatScore = (score: number | null) => {
  if (score == null) return '—';

  return Number.isInteger(score) ? score.toFixed(1) : String(score);
};

const statusOf = (run: EvaluationRun) => String(run.status ?? '').toLowerCase();

export const isRunComplete = (run: EvaluationRun) => ['success', 'completed'].includes(statusOf(run));

export const isRunFailed = (run: EvaluationRun) => ['failed', 'error'].includes(statusOf(run));

export const isRunInProgress = (run: EvaluationRun) => !isRunComplete(run) && !isRunFailed(run);

export const parseEvaluationScores = (raw: unknown): EvaluationTrace[] => {
  let parsed: any = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
  }

  if (!parsed) return [];

  const traces = Array.isArray(parsed) ? parsed : parsed.score?.traces;
  if (!Array.isArray(traces)) return [];

  const text = (row: any, ...keys: string[]) => {
    for (const key of keys) {
      if (typeof row?.[key] === 'string' && row[key] !== '') return row[key];
    }
    return '';
  };

  return traces
    .filter((row) => row && typeof row === 'object')
    .map((row) => ({
      questionId: String(row.question_id ?? row.questionId ?? ''),
      question: text(row, 'question'),
      expected: text(row, 'ground_truth_answer', 'golden_answer', 'expected_answer'),
      answer: text(row, 'llm_answer', 'answer'),
      scores: (Array.isArray(row.scores) ? row.scores : [])
        .filter((score: any) => score && typeof score.name === 'string')
        .map((score: any) => ({
          name: score.name,
          value: asScore(score.value ?? score.avg ?? score.score),
        })),
    }))
    .sort((a, b) => {
      const left = Number(a.questionId);
      const right = Number(b.questionId);
      if (Number.isFinite(left) && Number.isFinite(right)) return left - right;
      return a.questionId.localeCompare(b.questionId);
    });
};

export const traceMetricNames = (traces: EvaluationTrace[]) => [
  ...new Set(traces.flatMap((trace) => trace.scores.map((score) => score.name))),
];

/**
 * Column headings repeat "Adherence to" three times over, prefix is dropped for display only.
 */
export const shortMetricName = (name: string) => name.replace(/^adherence to\s+/i, '').trim() || name;

/** the judge's own overall score, so the card does not have to invent one */
export const parseOverallScore = (raw: unknown): number | null => {
  let parsed: any = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  return asScore(parsed?.score?.overall?.overall_score);
};

export const parseEvaluationSummary = (raw: unknown): string | null => {
  let parsed: any = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  const summary = parsed?.score?.overall?.ai_summary;

  return typeof summary === 'string' && summary.trim() ? summary.trim() : null;
};

export const evaluationRunName = (assistantName: string, versionNumber: number | undefined, setName: string) =>
  `${assistantName}-v${versionNumber ?? 1}-${setName}-${Date.now()}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
