import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { GET_EVALUATION_SCORES } from 'graphql/queries/AIEvaluations';
import type { EvaluationRun, EvaluationScoresFormat } from 'containers/AIEvaluation/types/evaluationType';
import {
  isRunComplete,
  parseEvaluationScores,
  parseEvaluationSummary,
  parseOverallScore,
  parseScoreMetrics,
} from 'containers/AIEvaluation/utils/evaluation/evaluation';
import { EmptyState } from 'components/UI/EmptyState/EmptyState';
import { EvaluationResult } from '../EvaluationResult/EvaluationResult';
import { EvaluationScores } from '../EvaluationScores/EvaluationScores';
import { SuggestedPrompt } from '../SuggestedPrompt/SuggestedPrompt';
import styles from './RunPanel.module.css';

const TAB_SLOT = '\u0000';

export interface RunPanelProps {
  run?: EvaluationRun;
  versionLabel?: string;
  onGoToHistory: () => void;
}

export const RunPanel = ({ run, versionLabel, onGoToHistory }: RunPanelProps) => {
  const { t } = useTranslation();

  const footNote = t('See every past run in the {{tab}} tab', { tab: TAB_SLOT }).split(TAB_SLOT);

  const [scoresFormat, setScoresFormat] = useState<EvaluationScoresFormat>('row');

  const finished = Boolean(run) && isRunComplete(run as EvaluationRun);
  const { data, loading, error } = useQuery(GET_EVALUATION_SCORES, {
    variables: { id: run?.id, exportFormat: 'row' },
    skip: !finished,
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: groupedData,
    loading: groupedLoading,
    error: groupedError,
  } = useQuery(GET_EVALUATION_SCORES, {
    variables: { id: run?.id, exportFormat: 'grouped' },
    skip: !finished || scoresFormat !== 'grouped',
    fetchPolicy: 'cache-and-network',
  });

  const scores = data?.evaluationScores;
  const overall = parseOverallScore(scores?.scores);
  const awaitingScores = finished && loading && !data;

  const grouped = scoresFormat === 'grouped';
  const tableScores = grouped ? groupedData?.evaluationScores : scores;
  const tableLoading = grouped ? groupedLoading : loading;
  const tableError = grouped ? groupedError : error;
  const failure =
    tableError || tableScores?.errors?.length
      ? tableScores?.errors?.[0]?.message || t('These results could not be loaded.')
      : null;

  return (
    <>
      {run && (
        <EvaluationResult
          run={run}
          overall={overall}
          summary={parseEvaluationSummary(scores?.scores)}
          loading={awaitingScores}
        >
          <EvaluationScores
            runId={run.id}
            traces={parseEvaluationScores(tableScores?.scores)}
            loading={tableLoading}
            failure={failure}
            format={scoresFormat}
            onFormatChange={setScoresFormat}
          />
        </EvaluationResult>
      )}

      {run && !awaitingScores && overall != null && (
        <SuggestedPrompt runId={run.id} overall={overall} metrics={parseScoreMetrics(scores?.scores)} />
      )}

      {!run && (
        <EmptyState
          testId="noEvaluationsYet"
          title={
            versionLabel
              ? t('No evaluations yet for version {{version}}', { version: versionLabel })
              : t('No evaluations yet for this version')
          }
          note={t('Run one to see how this version scores against a Golden Q&A.')}
        />
      )}

      <div className={styles.FootNote}>
        {footNote[0]}
        <button type="button" className={styles.FootNoteLink} onClick={onGoToHistory} data-testid="goToHistoryButton">
          {t('History')}
        </button>
        {footNote[1]}
      </div>
    </>
  );
};
