import { useTranslation } from 'react-i18next';
import type { EvaluationRun } from 'containers/AIEvaluation/types/evaluationType';
import { EmptyState } from '../../../components';
import { EvaluationResult } from '../EvaluationResult/EvaluationResult';
import { EvaluationScores } from '../EvaluationScores/EvaluationScores';
import styles from './RunPanel.module.css';

export interface RunPanelProps {
  run?: EvaluationRun;
  versionNumber?: number;
  onGoToHistory: () => void;
}

export const RunPanel = ({ run, versionNumber, onGoToHistory }: RunPanelProps) => {
  const { t } = useTranslation();

  return (
    <>
      {run ? (
        <EvaluationResult run={run}>
          <EvaluationScores runId={run.id} />
        </EvaluationResult>
      ) : (
        <EmptyState
          testId="noEvaluationsYet"
          title={`${t('No evaluations yet for')} ${versionNumber ? `${t('Version')} ${versionNumber}` : t('this version')}`}
          note={t('Run one to see how this version scores against a Golden Q&A set.')}
        />
      )}

      <div className={styles.FootNote}>
        {t('See every past run in the')}{' '}
        <button type="button" className={styles.FootNoteLink} onClick={onGoToHistory} data-testid="goToHistoryButton">
          {t('History')}
        </button>{' '}
        {t('tab above.')}
      </div>
    </>
  );
};
