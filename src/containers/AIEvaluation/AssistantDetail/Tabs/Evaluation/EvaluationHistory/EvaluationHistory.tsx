import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { EvaluationRun } from 'containers/AIEvaluation/types/evaluationType';
import {
  METRIC_HINT,
  configVersionLabel,
  formatScore,
  isRunFailed,
  isRunInProgress,
  overallScore,
  parseEvaluationResults,
  scoreBand,
} from 'containers/AIEvaluation/utils/evaluation/evaluation';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';
import { Button } from 'components/UI/Form/Button/Button';
import { DataTable } from 'components/UI/DataTable/DataTable';
import { downloadCsv, toCsv } from 'containers/AIEvaluation/utils/csv/csv';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import type { GoldenQaSet } from 'containers/AIEvaluation/types/goldenQaType';
import { LivePill } from '../../../components';
import styles from './EvaluationHistory.module.css';

dayjs.extend(relativeTime);

const ALL_SETS = 'all';

export interface EvaluationHistoryProps {
  runs: EvaluationRun[];
  liveVersionId?: string;
  sets: GoldenQaSet[];
  selectedSetId: string;
  onSetChange: (goldenQaId: string) => void;
}

export const EvaluationHistory = ({
  runs,
  liveVersionId,
  sets,
  selectedSetId,
  onSetChange,
}: EvaluationHistoryProps) => {
  const { t } = useTranslation();

  const score = (value: number | null) => {
    if (value == null) return <span className={styles.NoScore}>—</span>;

    return <span className={`${styles.Score} ${styles[scoreBand(value)]}`}>{formatScore(value)}</span>;
  };

  const metricHeader = (label: string, key: keyof typeof METRIC_HINT) => (
    <span className={styles.MetricHeader}>
      {label}
      <Tooltip title={t(METRIC_HINT[key])} placement="top" tooltipClass={styles.MetricTooltip}>
        <InfoOutlinedIcon className={styles.MetricIcon} data-testid={`historyMetricHint-${key}`} />
      </Tooltip>
    </span>
  );

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
            {run.assistantConfigVersion ? `${t('Version')} ${configVersionLabel(run.assistantConfigVersion)}` : '—'}
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
        t('Golden Q&A'),
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
          configVersionLabel(run.assistantConfigVersion),
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
          {sets.length > 0 && (
            <div className={styles.Filter}>
              <span className={styles.FilterLabel}>{t('Filter')}</span>
              <Dropdown
                placeholder=""
                options={[
                  { id: ALL_SETS, label: t('All Golden Q&A') },
                  ...sets.map((set) => ({ id: set.id, label: set.name })),
                ]}
                field={{
                  name: 'historyGoldenQa',
                  value: selectedSetId || ALL_SETS,
                  onChange: (event: { target: { value: string } }) =>
                    onSetChange(event.target.value === ALL_SETS ? '' : event.target.value),
                }}
                menuProps={{ 'data-testid': 'historyFilterMenu' }}
              />
            </div>
          )}
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
          className={styles.HistoryTable}
          testId="evaluationHistoryTable"
          rowTestId="evaluationRun"
          maxHeight="30rem"
          columns={[
            { label: t('Version') },
            { label: t('Golden Q&A') },
            { label: t('Duplication Factor'), className: styles.DuplicationColumn },
            {
              label: (
                <span className={styles.MetricHeader}>
                  {t('Overall')}
                  <Tooltip
                    title={t('The final score for this run — a weighted average of the three checks beside it.')}
                    placement="top"
                    tooltipClass={styles.MetricTooltip}
                  >
                    <InfoOutlinedIcon className={styles.MetricIcon} data-testid="historyOverallHint" />
                  </Tooltip>
                </span>
              ),
              className: styles.OverallColumn,
            },
            { label: metricHeader(t('Ground truth'), 'groundTruth'), className: styles.MetricColumn },
            { label: metricHeader(t('Knowledge base'), 'knowledgeBase'), className: styles.MetricColumn },
            { label: metricHeader(t('Prompt'), 'prompt'), className: styles.MetricColumn },
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
