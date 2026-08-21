import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { GET_EVALUATION_SCORES } from 'graphql/queries/AIEvaluations';
import type { EvaluationRun } from 'containers/AIEvaluation/types/evaluationType';
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
  versionNumber?: number;
  onGoToHistory: () => void;
}

export const RunPanel = ({ run, versionNumber, onGoToHistory }: RunPanelProps) => {
  const { t } = useTranslation();

  const footNote = t('See every past run in the {{tab}} tab', { tab: TAB_SLOT }).split(TAB_SLOT);

  const finished = Boolean(run) && isRunComplete(run as EvaluationRun);
  const { data, loading, error } = useQuery(GET_EVALUATION_SCORES, {
    variables: { id: run?.id },
    skip: !finished,
    fetchPolicy: 'cache-and-network',
  });

  const scores = data?.evaluationScores;
  const overall = parseOverallScore(scores?.scores);
  const awaitingScores = finished && loading && !data;
  const failure =
    error || scores?.errors?.length ? scores?.errors?.[0]?.message || t('These results could not be loaded.') : null;

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
            traces={parseEvaluationScores(scores?.scores)}
            loading={loading}
            failure={failure}
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
            versionNumber
              ? t('No evaluations yet for version {{version}}', { version: versionNumber })
              : t('No evaluations yet for this version')
          }
          note={t('Run one to see how this version scores against a Golden Q&A set.')}
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
