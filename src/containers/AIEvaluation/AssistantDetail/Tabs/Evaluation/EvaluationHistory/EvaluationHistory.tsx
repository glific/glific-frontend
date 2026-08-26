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
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { Button } from 'components/UI/Form/Button/Button';
import { DataTable } from 'components/UI/DataTable/DataTable';
import { downloadCsv, toCsv } from 'containers/AIEvaluation/utils/csv/csv';
import { LivePill } from '../../../components';
import styles from './EvaluationHistory.module.css';

dayjs.extend(relativeTime);

export interface EvaluationHistoryProps {
  runs: EvaluationRun[];
  liveVersionId?: string;
}

export const EvaluationHistory = ({ runs, liveVersionId }: EvaluationHistoryProps) => {
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
        <span className={styles.VersionCell}>
          <span className={styles.Version}>
            {run.assistantConfigVersion ? `${t('Version')} ${run.assistantConfigVersion.versionNumber}` : '—'}
          </span>
          {liveVersionId && run.assistantConfigVersion?.id === liveVersionId && <LivePill />}
        </span>,
        run.goldenQa?.name ?? '—',
        `${run.duplicationFactor ?? 1}×`,
        state(run) ?? score(overall),
        score(metrics.groundTruth),
        score(metrics.knowledgeBase),
        score(metrics.prompt),
        <span className={styles.When}>{dayjs(run.insertedAt).fromNow()}</span>,
      ],
    };
  });

  const exportHistory = () => {
    const csvRows = [
      [
        t('Version'),
        t('Golden Q&A set'),
        t('Duplication Factor'),
        t('Status'),
        t('Overall'),
        t('Ground truth'),
        t('Knowledge base'),
        t('Prompt'),
        t('When'),
      ],
      ...runs.map((run) => {
        const metrics = parseEvaluationResults(run.results);
        const cell = (value: number | null) => (value == null ? '' : formatScore(value));
        let status = t('Completed');
        if (isRunInProgress(run)) status = t('Running');
        else if (isRunFailed(run)) status = t('Failed');

        return [
          run.assistantConfigVersion ? String(run.assistantConfigVersion.versionNumber) : '',
          run.goldenQa?.name ?? '',
          String(run.duplicationFactor ?? 1),
          status,
          cell(overallScore(metrics)),
          cell(metrics.groundTruth),
          cell(metrics.knowledgeBase),
          cell(metrics.prompt),
          dayjs(run.insertedAt).format('YYYY-MM-DD HH:mm'),
        ];
      }),
    ];

    downloadCsv('evaluation-history.csv', toCsv(csvRows));
  };

  return (
    <div data-testid="evaluationHistory">
      <div className={styles.Summary}>
        {runs.length} {runs.length === 1 ? t('evaluation') : t('evaluations')} ·{' '}
        {t('on-demand runs against your curated questions.')}
      </div>

      <div className={styles.Card}>
        <div className={styles.CardHeader}>
          <Button
            variant="outlined"
            className={styles.ExportButton}
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={exportHistory}
            data-testid="exportHistoryButton"
          >
            {t('Export CSV')}
          </Button>
        </div>

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
