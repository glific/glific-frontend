import { useTranslation } from 'react-i18next';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { Button } from 'components/UI/Form/Button/Button';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { downloadCsv, toCsv } from 'containers/AIEvaluation/utils/csv/csv';
import {
  formatScore,
  scoreBand,
  shortMetricName,
  traceMetricNames,
} from 'containers/AIEvaluation/utils/evaluation/evaluation';
import type { EvaluationTrace } from 'containers/AIEvaluation/types/evaluationType';
import { DataTable } from 'components/UI/DataTable/DataTable';
import { MarkdownAnswer } from '../../../components';
import styles from './EvaluationScores.module.css';

export interface EvaluationScoresProps {
  runId: string;
  traces: EvaluationTrace[];
  loading?: boolean;
  failure?: string | null;
}

export const EvaluationScores = ({ runId, traces, loading = false, failure = null }: EvaluationScoresProps) => {
  const { t } = useTranslation();

  const metricNames = traceMetricNames(traces);

  if (loading && traces.length === 0) return <Loading />;

  if (failure) {
    return (
      <div className={styles.Note} data-testid="evaluationScoresError">
        {failure}
      </div>
    );
  }

  if (traces.length === 0) {
    return (
      <div className={styles.Note} data-testid="evaluationScoresEmpty">
        {t('This run reported no question-level results.')}
      </div>
    );
  }

  const exportScores = () => {
    const rows = [
      [t('Question'), t('Expected answer'), t('Assistant answer'), ...metricNames],
      ...traces.map((trace) => [
        trace.question,
        trace.expected,
        trace.answer,
        ...metricNames.map((name) => {
          const score = trace.scores.find((entry) => entry.name === name)?.value;
          return score == null ? '' : String(score);
        }),
      ]),
    ];

    downloadCsv(`evaluation-${runId}-question-level-results.csv`, toCsv(rows));
  };

  const rows = traces.map((trace, index) => ({
    key: trace.questionId || `trace-${index}`,
    cells: [
      <span className={styles.Question}>{trace.question || '—'}</span>,
      <div className={styles.Answer}>{trace.expected || '—'}</div>,
      <div className={`${styles.Answer} ${styles.AssistantAnswer}`}>
        {trace.answer ? <MarkdownAnswer text={trace.answer} /> : '—'}
      </div>,
      ...metricNames.map((name) => {
        const score = trace.scores.find((entry) => entry.name === name)?.value ?? null;

        return score == null ? (
          <span className={styles.NoScore}>—</span>
        ) : (
          <span className={`${styles.Score} ${styles[scoreBand(score)]}`}>{formatScore(score)}</span>
        );
      }),
    ],
  }));

  return (
    <div data-testid="evaluationScores">
      <div className={styles.Header}>
        <span className={styles.Title}>{t('Question-level results')}</span>
        <span className={styles.Count}>
          {traces.length === 1 ? t('1 question') : t('{{count}} questions', { count: traces.length })}
        </span>
        <Button
          variant="outlined"
          className={styles.ExportButton}
          startIcon={<FileDownloadOutlinedIcon />}
          onClick={exportScores}
          data-testid="exportScoresButton"
        >
          {t('Export CSV')}
        </Button>
      </div>

      <DataTable
        className={styles.ScoresTable}
        testId="evaluationScoresTable"
        rowTestId="evaluationScoreRow"
        maxHeight="30rem"
        columns={[
          { label: t('Question'), className: styles.QuestionColumn },
          { label: t('Expected answer'), className: styles.ExpectedColumn },
          { label: t('Assistant answer'), className: styles.AnswerColumn },
          ...metricNames.map((name) => ({ label: shortMetricName(name), className: styles.ScoreColumn })),
        ]}
        rows={rows}
      />
    </div>
  );
};
