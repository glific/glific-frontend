import { useQuery } from '@apollo/client';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { GET_EVALUATION_SCORES } from 'graphql/queries/AIEvaluations';
import type { EvaluationMetrics, EvaluationRun } from 'containers/AIEvaluation/types/evaluationType';
import {
  MAX_SCORE,
  METRIC_WEIGHTS,
  formatScore,
  isRunFailed,
  isRunInProgress,
  overallScore,
  parseEvaluationOverall,
  parseEvaluationResults,
  scoreBand,
} from 'containers/AIEvaluation/utils/evaluation/evaluation';
import styles from './EvaluationResult.module.css';

dayjs.extend(relativeTime);

export interface EvaluationResultProps {
  run: EvaluationRun;
  children?: ReactNode;
}

const METRIC_ORDER = [
  { key: 'groundTruth', label: 'Adherence to ground truth' },
  { key: 'knowledgeBase', label: 'Adherence to knowledge base' },
  { key: 'prompt', label: 'Adherence to prompt' },
] as const satisfies readonly { key: keyof EvaluationMetrics; label: string }[];

const BAND_LABEL = {
  good: 'Good',
  okay: 'Could improve',
  bad: 'Needs improvement',
} as const;

/** five steps, each filled by however much of that point the score reached */
const ScoreBar = ({ score, band }: { score: number; band: string }) => (
  <div className={styles.Bar} data-testid="scoreBar">
    {Array.from({ length: MAX_SCORE }, (_, step) => (
      <span key={step} className={styles.Step}>
        <span
          className={`${styles.StepFill} ${styles[`${band}Fill`]}`}
          style={{ width: `${Math.max(0, Math.min(1, score - step)) * 100}%` }}
        />
      </span>
    ))}
  </div>
);

export const EvaluationResult = ({ run, children }: EvaluationResultProps) => {
  const { t } = useTranslation();

  // the same payload the question-level table reads; Apollo serves it from cache
  const { data: scoreData } = useQuery(GET_EVALUATION_SCORES, {
    variables: { id: run.id },
    fetchPolicy: 'cache-first',
  });
  const { summary } = parseEvaluationOverall(scoreData?.evaluationScores?.scores);

  const metrics = parseEvaluationResults(run.results);
  const overall = overallScore(metrics);

  const scored = METRIC_ORDER.filter((metric) => metrics[metric.key] != null);
  const weakest = [...scored].sort((a, b) => (metrics[a.key] as number) - (metrics[b.key] as number))[0];

  const meta = [
    run.assistantConfigVersion ? `${t('Version')} ${run.assistantConfigVersion.versionNumber}` : null,
    run.goldenQa?.name,
    `${run.goldenQa?.duplicationFactor ?? 1}× ${t('duplication')}`,
    dayjs(run.insertedAt).fromNow(),
  ]
    .filter(Boolean)
    .join(' · ');

  const metaLine = (
    <div className={styles.MetaLine}>
      <span className={styles.MetaLabel}>{t('Last run')}</span> {meta}
    </div>
  );

  if (isRunInProgress(run)) {
    return (
      <div className={styles.Wrap} data-testid="evaluationRunning">
        {metaLine}
        <div className={`${styles.Card} ${styles.PendingCard}`}>
          <span className={styles.PendingDot} />
          <div className={styles.PendingTitle}>{t('Evaluation in progress')}</div>
          <div className={styles.PendingNote}>
            {t(
              "This runs in the background, so there's no progress to show — the result appears here once it completes. You can switch tabs or leave this page."
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isRunFailed(run) || overall == null) {
    return (
      <div className={styles.Wrap} data-testid="evaluationFailed">
        {metaLine}
        <div className={styles.Card}>
          <div className={styles.Failed}>{run.failureReason || t('This evaluation did not produce a score.')}</div>
        </div>
      </div>
    );
  }

  const band = scoreBand(overall);

  return (
    <div className={styles.Wrap} data-testid="evaluationResult">
      {metaLine}

      <div className={styles.Card}>
        <div className={`${styles.Banner} ${styles[`${band}Banner`]}`}>
          <div
            className={`${styles.Ring} ${styles[`${band}Ring`]}`}
            style={{
              background: `conic-gradient(currentColor ${(overall / MAX_SCORE) * 360}deg, var(--app-color-border) 0)`,
            }}
            data-testid="overallScore"
          >
            <span className={styles.RingInner}>
              <span className={styles.RingScore}>
                {formatScore(overall)}
                <span className={styles.RingOutOf}>/{MAX_SCORE}</span>
              </span>
              <span className={styles.RingLabel}>{t('Overall')}</span>
            </span>
          </div>

          <div className={styles.BannerText}>
            <span className={`${styles.BandPill} ${styles[`${band}Pill`]}`} data-testid="scoreBand">
              {t(BAND_LABEL[band])}
            </span>
            {summary ? (
              <div className={styles.BannerSummary} data-testid="evaluationSummary">
                {summary}
              </div>
            ) : (
              weakest && (
                <div className={styles.BannerNote}>
                  {t('Weakest check is')} <b>{t(weakest.label).toLowerCase()}</b> {t('at')}{' '}
                  {formatScore(metrics[weakest.key])}/{MAX_SCORE}.
                </div>
              )
            )}
          </div>
        </div>

        <div className={styles.Divider} />

        <div className={styles.BuiltFrom}>
          <b>{t('How the overall score is built')}</b> — {t('weighted average of each check, scored 0–5')}
        </div>

        {METRIC_ORDER.map((metric) => {
          const score = metrics[metric.key];
          const weight = `${METRIC_WEIGHTS[metric.key] * 100}%`;

          return (
            <div className={styles.Metric} key={metric.key} data-testid={`metric-${metric.key}`}>
              <div className={styles.MetricHead}>
                <span className={styles.MetricLabel}>{t(metric.label)}</span>
                <span className={styles.MetricWeight}>
                  · {t('weight')} {weight}
                </span>
                <span
                  className={`${styles.MetricScore} ${score == null ? styles.NoScore : styles[`${scoreBand(score)}Text`]}`}
                >
                  {formatScore(score)}
                  {score != null && <span className={styles.MetricOutOf}>/{MAX_SCORE}</span>}
                </span>
              </div>
              {score == null ? (
                <div className={styles.NotScored}>{t('Not scored in this run.')}</div>
              ) : (
                <ScoreBar score={score} band={scoreBand(score)} />
              )}
            </div>
          );
        })}

        <div className={styles.Legend}>
          <span>
            <i className={styles.badFill} /> 0–1 {t('needs improvement')}
          </span>
          <span>
            <i className={styles.okayFill} /> 2–3 {t('could improve')}
          </span>
          <span>
            <i className={styles.goodFill} /> 4–5 {t('good')}
          </span>
        </div>

        {children && (
          <>
            <div className={styles.Divider} />
            {children}
          </>
        )}
      </div>
    </div>
  );
};

export default EvaluationResult;
