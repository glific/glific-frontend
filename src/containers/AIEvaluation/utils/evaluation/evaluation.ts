import type { EvaluationMetrics, EvaluationRun } from 'containers/AIEvaluation/types/evaluationType';

export const MAX_SCORE = 5;

export const METRIC_WEIGHTS = { groundTruth: 0.5, knowledgeBase: 0.3, prompt: 0.2 };

/** the judge names each metric in prose, so matching is on words rather than an exact string */
const METRIC_MATCHERS: { key: keyof EvaluationMetrics; matches: (name: string) => boolean }[] = [
  { key: 'groundTruth', matches: (name) => name.includes('ground') && name.includes('truth') },
  { key: 'knowledgeBase', matches: (name) => name.includes('knowledge') },
  { key: 'prompt', matches: (name) => name.includes('prompt') },
];

const EMPTY_METRICS: EvaluationMetrics = { groundTruth: null, knowledgeBase: null, prompt: null };

const asScore = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : null);

/**
 * `results` arrives as a JSON string holding `summary_scores` — one entry per metric, named in
 * prose ("Adherence to Ground Truth") with its average. A run only reports the metrics that
 * applied to it: an assistant with no knowledge base has no knowledge-base score.
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
 * A weighted average of whatever the run actually scored. The weights are re-normalised over
 * the metrics present, so a run without a knowledge-base score is not dragged down by it —
 * null only when nothing was scored at all.
 */
export const overallScore = (metrics: EvaluationMetrics) => {
  const scored = (Object.keys(METRIC_WEIGHTS) as (keyof EvaluationMetrics)[]).filter((key) => metrics[key] != null);
  if (scored.length === 0) return null;

  const totalWeight = scored.reduce((sum, key) => sum + METRIC_WEIGHTS[key], 0);
  const weighted = scored.reduce((sum, key) => sum + (metrics[key] as number) * METRIC_WEIGHTS[key], 0);

  return Math.round((weighted / totalWeight) * 10) / 10;
};

export type ScoreBand = 'good' | 'okay' | 'bad';

/** the judge scores 0–5: 0–1 unusable, 2–3 partly right, 4–5 correct */
export const scoreBand = (score: number): ScoreBand => {
  if (score >= 4) return 'good';
  if (score >= 2) return 'okay';
  return 'bad';
};

export const formatScore = (score: number | null) => (score == null ? '—' : score.toFixed(1));

/** the backend reports status in upper case, so every check works off a normalised copy */
const statusOf = (run: EvaluationRun) => String(run.status ?? '').toLowerCase();

/** a run is only worth reading once the judge has finished with it */
export const isRunComplete = (run: EvaluationRun) => ['success', 'completed'].includes(statusOf(run));

export const isRunFailed = (run: EvaluationRun) => ['failed', 'error'].includes(statusOf(run));

export const isRunInProgress = (run: EvaluationRun) => !isRunComplete(run) && !isRunFailed(run);

export interface EvaluationTrace {
  questionId: string;
  question: string;
  expected: string;
  answer: string;
  scores: { name: string; value: number | null }[];
}

/**
 * `scores` is a JSON string wrapping `score.traces` — one entry per question asked, each
 * carrying the answer the assistant gave and whatever the judge scored it on. Field names
 * differ between runs (`ground_truth_answer` vs `golden_answer`), so each is read by turns.
 */
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
 * Column headings repeat "Adherence to" three times over, which costs width the answers need.
 * The prefix is dropped for display only — the full name still identifies the metric.
 */
export const shortMetricName = (name: string) => name.replace(/^adherence to\s+/i, '').trim() || name;

export interface EvaluationOverall {
  score: number | null;
  verdict: string | null;
  summary: string | null;
}

/**
 * `score.overall` is the judge's own read of the run — its score, its verdict, and a written
 * summary of what went well and what to look at. Only the summary is shown today, but the
 * whole thing is parsed so the rest is there when it is wanted.
 */
export const parseEvaluationOverall = (raw: unknown): EvaluationOverall => {
  const empty = { score: null, verdict: null, summary: null };

  let parsed: any = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return empty;
    }
  }

  const overall = parsed?.score?.overall;
  if (!overall || typeof overall !== 'object') return empty;

  const summary = typeof overall.ai_summary === 'string' ? overall.ai_summary.trim() : '';

  return {
    score: asScore(overall.overall_score),
    verdict: typeof overall.verdict === 'string' ? overall.verdict : null,
    summary: summary || null,
  };
};
