import { useTranslation } from 'react-i18next';
import type { EvaluationRun } from 'containers/AIEvaluation/types/evaluationType';
import { EmptyState } from 'components/UI/EmptyState/EmptyState';
import { EvaluationResult } from '../EvaluationResult/EvaluationResult';
import { EvaluationScores } from '../EvaluationScores/EvaluationScores';
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

  return (
    <>
      {run ? (
        <EvaluationResult run={run}>
          <EvaluationScores runId={run.id} />
        </EvaluationResult>
      ) : (
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
