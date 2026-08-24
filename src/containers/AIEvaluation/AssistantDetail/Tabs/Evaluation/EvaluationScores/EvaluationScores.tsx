import { useTranslation } from 'react-i18next';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';
import { Button } from 'components/UI/Form/Button/Button';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { downloadCsv, toCsv } from 'containers/AIEvaluation/utils/csv/csv';
import {
  formatScore,
  scoreBand,
  shortMetricName,
  traceMetricNames,
} from 'containers/AIEvaluation/utils/evaluation/evaluation';
import type {
  EvaluationScoresFormat,
  EvaluationTrace,
  EvaluationTraceAnswer,
  EvaluationTraceScore,
} from 'containers/AIEvaluation/types/evaluationType';
import { SegmentedControl } from 'components/UI/SegmentedControl/SegmentedControl';
import { DataTable } from 'components/UI/DataTable/DataTable';
import { MarkdownAnswer } from '../../../components';
import styles from './EvaluationScores.module.css';

export interface EvaluationScoresProps {
  runId: string;
  traces: EvaluationTrace[];
  loading?: boolean;
  failure?: string | null;
  format?: EvaluationScoresFormat;
  onFormatChange?: (format: EvaluationScoresFormat) => void;
}

export const EvaluationScores = ({
  runId,
  traces,
  loading = false,
  failure = null,
  format = 'row',
  onFormatChange,
}: EvaluationScoresProps) => {
  const { t } = useTranslation();

  const metricNames = traceMetricNames(traces);
  const grouped = format === 'grouped';
  const answerCount = traces.reduce((most, trace) => Math.max(most, trace.answers.length), 1);

  const scoreOf = (answer: EvaluationTraceAnswer, name: string) =>
    answer.scores.find((entry) => entry.name === name)?.value ?? null;

  const exportScores = () => {
    const rows = [
      [t('Question'), t('Expected answer'), t('Assistant answer'), ...metricNames],
      ...traces.flatMap((trace) =>
        trace.answers.map((answer) => [
          trace.question,
          trace.expected,
          answer.answer,
          ...metricNames.map((name) => {
            const score = scoreOf(answer, name);
            return score == null ? '' : String(score);
          }),
        ])
      ),
    ];

    downloadCsv(`evaluation-${runId}-question-level-results.csv`, toCsv(rows));
  };

  const scorePill = (score: number | null) =>
    score == null ? (
      <span className={styles.NoScore}>—</span>
    ) : (
      <span className={`${styles.Score} ${styles[scoreBand(score)]}`}>{formatScore(score)}</span>
    );

  const scoreWithReason = (score?: EvaluationTraceScore) => (
    <span className={styles.ScoreCell}>
      {scorePill(score?.value ?? null)}
      {score?.comment ? (
        <Tooltip title={score.comment} placement="top" tooltipClass={styles.ReasonTooltip} interactive>
          <InfoOutlinedIcon className={styles.ReasonIcon} data-testid="scoreReason" />
        </Tooltip>
      ) : null}
    </span>
  );

  // in grouped view the judge's marks sit under the answer they belong to, not in their own columns
  const answerCell = (answer?: EvaluationTraceAnswer) => {
    if (!answer) return <span className={styles.NoScore}>—</span>;

    return (
      <div className={styles.AnswerCell}>
        <div className={styles.Answer}>{answer.answer ? <MarkdownAnswer text={answer.answer} /> : '—'}</div>
        {answer.scores.length > 0 && (
          <div className={styles.AnswerScores}>
            {answer.scores.map((score) => (
              <div className={styles.AnswerScore} key={score.name}>
                <span className={styles.AnswerScoreName}>{shortMetricName(score.name)}</span>
                {scoreWithReason(score)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const columns = [
    { label: t('Question'), className: styles.QuestionColumn },
    { label: t('Expected answer'), className: styles.ExpectedColumn },
    ...(grouped
      ? Array.from({ length: answerCount }, (_, position) => ({
          label: t('Answer {{position}}', { position: String(position + 1) }),
          className: styles.AnswerColumn,
        }))
      : [
          { label: t('Assistant answer'), className: styles.AnswerColumn },
          ...metricNames.map((name) => ({ label: shortMetricName(name), className: styles.ScoreColumn })),
        ]),
  ];

  const rows = traces.map((trace, index) => ({
    key: `${trace.questionId || 'trace'}-${index}`,
    cells: [
      <span className={styles.Question}>{trace.question || '—'}</span>,
      <div className={styles.Answer}>{trace.expected || '—'}</div>,
      ...(grouped
        ? Array.from({ length: answerCount }, (_, position) => answerCell(trace.answers[position]))
        : [
            <div className={styles.Answer}>
              {trace.answers[0]?.answer ? <MarkdownAnswer text={trace.answers[0].answer} /> : '—'}
            </div>,
            ...metricNames.map((name) => scoreWithReason(trace.answers[0]?.scores.find((e) => e.name === name))),
          ]),
    ],
  }));

  const header = (
    <div className={styles.Header}>
      <span className={styles.Title}>{t('Question-level results')}</span>
      {traces.length > 0 && (
        <span className={styles.Count}>
          {traces.length === 1 ? t('1 question') : t('{{count}} questions', { count: traces.length })}
        </span>
      )}
      {onFormatChange && (
        <SegmentedControl<EvaluationScoresFormat>
          className={styles.FormatToggle}
          testId="scoresFormatToggle"
          options={[
            { value: 'row', label: t('Individual Rows') },
            { value: 'grouped', label: t('Group by Questions') },
          ]}
          value={format}
          onChange={onFormatChange}
        />
      )}
      <Button
        variant="outlined"
        className={styles.ExportButton}
        startIcon={<FileDownloadOutlinedIcon />}
        onClick={exportScores}
        disabled={traces.length === 0}
        data-testid="exportScoresButton"
      >
        {t('Export CSV')}
      </Button>
    </div>
  );

  const body = () => {
    if (loading && traces.length === 0) {
      return (
        <div className={styles.LoadingArea}>
          <Loading />
        </div>
      );
    }

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

    return (
      <DataTable
        className={`${styles.ScoresTable} ${grouped ? styles.GroupedTable : ''}`}
        testId="evaluationScoresTable"
        rowTestId="evaluationScoreRow"
        maxHeight="30rem"
        columns={columns}
        rows={rows}
      />
    );
  };

  return (
    <div data-testid="evaluationScores">
      {header}
      {body()}
    </div>
  );
};
