import type {
  EvaluationListData,
  EvaluationMetrics,
  EvaluationRun,
  EvaluationTrace,
  EvaluationTraceAnswer,
  JsonRecord,
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

/** payloads arrive either already parsed or as a JSON string; anything unreadable is undefined */
const asJson = (raw: unknown): unknown => {
  if (typeof raw !== 'string') return raw;

  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

const isRecord = (value: unknown): value is JsonRecord => Boolean(value) && typeof value === 'object';

/** walks a path through a payload without assuming any of it exists */
const field = (source: unknown, ...path: string[]): unknown =>
  path.reduce<unknown>((current, key) => (isRecord(current) ? current[key] : undefined), source);

/**
 * `results` is a JSON string containing `summary_scores`, with one average score per applicable metric named in plain language; metrics that don’t apply to a run are omitted.
 */
export const parseEvaluationResults = (results: unknown): EvaluationMetrics => {
  const parsed = asJson(results);
  if (!isRecord(parsed)) return EMPTY_METRICS;

  const metrics: EvaluationMetrics = { ...EMPTY_METRICS };

  const summary = parsed.summary_scores ?? parsed.summaryScores;
  if (Array.isArray(summary)) {
    summary.forEach((entry) => {
      const name = String(field(entry, 'name') ?? '').toLowerCase();
      const matched = METRIC_MATCHERS.find((matcher) => matcher.matches(name));
      if (matched) {
        metrics[matched.key] = asScore(field(entry, 'avg') ?? field(entry, 'average') ?? field(entry, 'score'));
      }
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

/** wording for each band, shared so the assistant list and the run card cannot drift apart */
export const BAND_LABEL = {
  good: 'Good',
  okay: 'Could improve',
  bad: 'Needs improvement',
} as const;

/**
 * `lastEvaluationSummary` on an assistant is the judge's summary of its most recent run. The
 * server flattens it when it stores the run, so `overall_score` sits at the top level.
 */
export const parseAssistantHealth = (raw: unknown): number | null => asScore(field(asJson(raw), 'overall_score'));

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
  const parsed = asJson(raw);

  const traces = Array.isArray(parsed) ? parsed : field(parsed, 'score', 'traces');
  if (!Array.isArray(traces)) return [];

  const text = (row: JsonRecord, ...keys: string[]) => {
    for (const key of keys) {
      const value = row[key];
      if (typeof value === 'string' && value !== '') return value;
    }
    return '';
  };

  const readScores = (rawScores: unknown) =>
    (Array.isArray(rawScores) ? rawScores : [])
      .filter((score): score is JsonRecord => isRecord(score) && typeof score.name === 'string')
      .map((score) => ({
        name: String(score.name),
        value: asScore(score.value ?? score.avg ?? score.score),
        comment: typeof score.comment === 'string' ? score.comment : '',
      }));

  const readAnswers = (row: JsonRecord): EvaluationTraceAnswer[] => {
    if (Array.isArray(row.llm_answers)) {
      // grouped: scores[i] belongs to llm_answers[i]
      const grouped = Array.isArray(row.scores) ? row.scores : [];
      return row.llm_answers.map((answer: unknown, index: number) => ({
        answer: typeof answer === 'string' ? answer : '',
        scores: readScores(grouped[index]),
      }));
    }

    return [{ answer: text(row, 'llm_answer', 'answer'), scores: readScores(row.scores) }];
  };

  return traces
    .filter(isRecord)
    .map((row) => ({
      questionId: String(row.question_id ?? row.questionId ?? ''),
      question: text(row, 'question'),
      expected: text(row, 'ground_truth_answer', 'golden_answer', 'expected_answer'),
      answers: readAnswers(row),
    }))
    .sort((a, b) => {
      const left = Number(a.questionId);
      const right = Number(b.questionId);
      if (Number.isFinite(left) && Number.isFinite(right)) return left - right;
      return a.questionId.localeCompare(b.questionId);
    });
};

export const traceMetricNames = (traces: EvaluationTrace[]) => [
  ...new Set(traces.flatMap((trace) => trace.answers.flatMap((entry) => entry.scores.map((score) => score.name)))),
];

/**
 * Column headings repeat "Adherence to" three times over, prefix is dropped for display only.
 */
export const shortMetricName = (name: string) => name.replace(/^adherence to\s+/i, '').trim() || name;

/** the judge's own overall score, so the card does not have to invent one */
export const parseOverallScore = (raw: unknown): number | null => {
  return asScore(field(asJson(raw), 'score', 'overall', 'overall_score'));
};

export const parseScoreMetrics = (raw: unknown): EvaluationMetrics => {
  return parseEvaluationResults(field(asJson(raw), 'score'));
};

export const parseEvaluationSummary = (raw: unknown): string | null => {
  const summary = field(asJson(raw), 'score', 'overall', 'ai_summary');

  return typeof summary === 'string' && summary.trim() ? summary.trim() : null;
};

export const evaluationRunName = (assistantName: string, versionNumber: number | undefined, setName: string) =>
  `${assistantName}-v${versionNumber ?? 1}-${setName}-${Date.now()}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

export const mergeEvaluationUpdate = (
  previous: EvaluationListData | undefined,
  updated?: EvaluationRun | null
): EvaluationListData => {
  const runs = previous?.aiEvaluations ?? [];

  if (!updated?.id) return previous ?? { aiEvaluations: runs };

  const known = runs.some((run) => run.id === updated.id);

  const withoutBlanks = Object.fromEntries(
    Object.entries(updated).filter(([, value]) => value !== null && value !== undefined)
  ) as Partial<EvaluationRun>;

  return {
    ...previous,
    aiEvaluations: known
      ? runs.map((run) => (run.id === updated.id ? { ...run, ...withoutBlanks } : run))
      : [updated, ...runs],
  };
};
