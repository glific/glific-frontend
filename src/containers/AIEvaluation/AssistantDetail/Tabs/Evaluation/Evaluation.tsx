import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Button } from 'components/UI/Form/Button/Button';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { SegmentedControl } from 'components/UI/SegmentedControl/SegmentedControl';
import { LIST_AI_EVALUATIONS, LIST_GOLDEN_QA } from 'graphql/queries/AIEvaluations';
import DocumentIcon from 'assets/images/icons/Document/Dark.svg?react';
import type { EvaluationRun, EvaluationSubTab } from 'containers/AIEvaluation/types/evaluationType';
import type { GoldenQaSet } from 'containers/AIEvaluation/types/goldenQaType';
import { AddGoldenQaSetDialog, ManageGoldenQaSetsDialog, ViewGoldenQaSetDialog } from './GoldenQA';
import { EvaluationHistory } from './EvaluationHistory/EvaluationHistory';
import { EvaluationResult } from './EvaluationResult/EvaluationResult';
import { EvaluationScores } from './EvaluationScores/EvaluationScores';
import { RunEvaluationDialog } from './RunEvaluationDialog/RunEvaluationDialog';
import styles from './Evaluation.module.css';

export interface EvaluationProps {
  versionId?: string;
  versionNumber?: number;
  assistantId?: string;
  assistantName?: string;
}

export const Evaluation = ({ versionId, versionNumber, assistantId, assistantName }: EvaluationProps) => {
  const { t } = useTranslation();

  const [subTab, setSubTab] = useState<EvaluationSubTab>('run');
  const [manageOpen, setManageOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [viewing, setViewing] = useState<GoldenQaSet | null>(null);
  const [runOpen, setRunOpen] = useState(false);

  const { data, loading, refetch } = useQuery(LIST_GOLDEN_QA, {
    variables: { filter: {}, opts: { order: 'DESC', orderWith: 'inserted_at' } },
    fetchPolicy: 'cache-and-network',
  });

  const { data: runData, refetch: refetchRuns } = useQuery(LIST_AI_EVALUATIONS, {
    variables: { filter: {}, opts: { order: 'DESC', orderWith: 'inserted_at' } },
    fetchPolicy: 'cache-and-network',
  });

  const sets: GoldenQaSet[] = data?.goldenQas ?? [];
  const allRuns: EvaluationRun[] = runData?.aiEvaluations ?? [];
  // the Run panel is about the version on screen; History is about the whole assistant
  const versionRuns = allRuns.filter((run) => run.assistantConfigVersion?.id === versionId);
  const latestRun = versionRuns[0];

  const addDialog = addOpen && (
    <AddGoldenQaSetDialog
      onClose={() => setAddOpen(false)}
      onAdded={() => {
        setAddOpen(false);
        refetch();
      }}
    />
  );

  if (loading && sets.length === 0) {
    return <Loading />;
  }

  if (sets.length === 0) {
    return (
      <div data-testid="evaluationTab">
        <div className={styles.Blocker} data-testid="goldenQaEmpty">
          <div className={styles.BlockerIcon}>
            <DocumentIcon />
          </div>
          <div className={styles.BlockerTitle}>{t('Add a Golden Q&A set to evaluate this assistant')}</div>
          <div className={styles.BlockerNote}>
            {t(
              'A fixed set of questions and their ideal answers. Every version is scored against the same set, so results stay comparable.'
            )}
          </div>
          <div className={styles.BlockerAction}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setAddOpen(true)}
              data-testid="addFirstSetButton"
            >
              {t('Add a Golden Q&A set')}
            </Button>
          </div>
        </div>
        {addDialog}
      </div>
    );
  }

  return (
    <div data-testid="evaluationTab">
      <div className={styles.Header}>
        <SegmentedControl<EvaluationSubTab>
          testId="evaluationSubTabs"
          options={[
            { value: 'run', label: t('Run') },
            { value: 'history', label: t('History') },
          ]}
          value={subTab}
          onChange={setSubTab}
        />

        {subTab === 'run' && (
          <div className={styles.Actions}>
            <Button
              variant="outlined"
              className={styles.ManageButton}
              startIcon={<AssignmentOutlinedIcon />}
              onClick={() => setManageOpen(true)}
              data-testid="manageSetsButton"
            >
              {t('Manage sets')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              className={styles.RunButton}
              startIcon={<PlayArrowIcon />}
              disabled={!versionId}
              onClick={() => setRunOpen(true)}
              data-testid="runEvaluationButton"
            >
              {latestRun ? t('Run another evaluation') : t('Run evaluation')}
            </Button>
          </div>
        )}
      </div>

      {subTab === 'run' ? (
        <>
          {latestRun ? (
            <EvaluationResult run={latestRun}>
              <EvaluationScores runId={latestRun.id} />
            </EvaluationResult>
          ) : (
            <div className={styles.Blocker} data-testid="noEvaluationsYet">
              <div className={styles.BlockerTitle}>
                {t('No evaluations yet for')} {versionNumber ? `${t('Version')} ${versionNumber}` : t('this version')}
              </div>
              <div className={styles.BlockerNote}>
                {t('Run one to see how this version scores against a Golden Q&A set.')}
              </div>
            </div>
          )}

          <div className={styles.FootNote}>
            {t('See every past run in the')}{' '}
            <button
              type="button"
              className={styles.FootNoteLink}
              onClick={() => setSubTab('history')}
              data-testid="goToHistoryButton"
            >
              {t('History')}
            </button>{' '}
            {t('tab above.')}
          </div>
        </>
      ) : allRuns.length > 0 ? (
        <EvaluationHistory runs={allRuns} />
      ) : (
        <div className={styles.Blocker} data-testid="evaluationHistoryEmpty">
          <div className={styles.BlockerTitle}>{t('No evaluations yet')}</div>
          <div className={styles.BlockerNote}>
            {t('Once you run an evaluation, every run shows up here so you can compare versions and Golden Q&A sets.')}
          </div>
          <div className={styles.BlockerAction}>
            <Button
              variant="contained"
              color="primary"
              className={styles.RunButton}
              startIcon={<PlayArrowIcon />}
              onClick={() => setSubTab('run')}
              data-testid="runFirstEvaluationButton"
            >
              {t('Run your first evaluation')}
            </Button>
          </div>
        </div>
      )}

      {manageOpen && (
        <ManageGoldenQaSetsDialog
          sets={sets}
          onView={(set) => {
            setManageOpen(false);
            setViewing(set);
          }}
          onAdd={() => {
            setManageOpen(false);
            setAddOpen(true);
          }}
          onClose={() => setManageOpen(false)}
        />
      )}

      {addDialog}

      {runOpen && (
        <RunEvaluationDialog
          sets={sets}
          versionId={versionId}
          versionNumber={versionNumber}
          assistantName={assistantName}
          onClose={() => setRunOpen(false)}
          onStarted={() => {
            setRunOpen(false);
            refetchRuns();
          }}
        />
      )}

      {viewing && (
        <ViewGoldenQaSetDialog
          set={viewing}
          onClose={() => setViewing(null)}
          onBack={() => {
            setViewing(null);
            setManageOpen(true);
          }}
        />
      )}
    </div>
  );
};

export default Evaluation;
