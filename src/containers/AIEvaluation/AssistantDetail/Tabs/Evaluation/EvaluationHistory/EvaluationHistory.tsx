import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { EvaluationRun } from 'containers/AIEvaluation/types/evaluationType';
import {
  formatScore,
  isRunFailed,
  isRunInProgress,
  overallScore,
  parseEvaluationResults,
  scoreBand,
} from 'containers/AIEvaluation/utils/evaluation/evaluation';
import { DataTable } from '../../../components';
import styles from './EvaluationHistory.module.css';

dayjs.extend(relativeTime);

export interface EvaluationHistoryProps {
  runs: EvaluationRun[];
}

export const EvaluationHistory = ({ runs }: EvaluationHistoryProps) => {
  const { t } = useTranslation();

  const score = (value: number | null) => {
    if (value == null) return <span className={styles.NoScore}>—</span>;

    return <span className={`${styles.Score} ${styles[scoreBand(value)]}`}>{formatScore(value)}</span>;
  };

  const state = (run: EvaluationRun) => {
    if (isRunInProgress(run)) return <span className={styles.Running}>{t('Running')}</span>;
    if (isRunFailed(run)) return <span className={styles.Failed}>{t('Failed')}</span>;
    return null;
  };

  const rows = runs.map((run) => {
    const metrics = parseEvaluationResults(run.results);
    const overall = overallScore(metrics);

    return {
      key: run.id,
      cells: [
        <span className={styles.Version}>
          {run.assistantConfigVersion ? `${t('Version')} ${run.assistantConfigVersion.versionNumber}` : '—'}
        </span>,
        run.goldenQa?.name ?? '—',
        `${run.goldenQa?.duplicationFactor ?? 1}×`,
        state(run) ?? score(overall),
        score(metrics.groundTruth),
        score(metrics.knowledgeBase),
        score(metrics.prompt),
        <span className={styles.When}>{dayjs(run.insertedAt).fromNow()}</span>,
      ],
    };
  });

  return (
    <div data-testid="evaluationHistory">
      <div className={styles.Summary}>
        {runs.length} {runs.length === 1 ? t('evaluation') : t('evaluations')} ·{' '}
        {t('on-demand runs against your curated questions.')}
      </div>

      <div className={styles.Card}>
        <DataTable
          testId="evaluationHistoryTable"
          rowTestId="evaluationRun"
          maxHeight="30rem"
          columns={[
            { label: t('Version') },
            { label: t('Golden Q&A set') },
            { label: t('Duplication Factor') },
            { label: t('Overall') },
            { label: t('Ground truth') },
            { label: t('Knowledge base') },
            { label: t('Prompt') },
            { label: t('When') },
          ]}
          rows={rows}
        />

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
          <span className={styles.LegendNote}>{t('all scores out of 5')}</span>
        </div>
      </div>
    </div>
  );
};
