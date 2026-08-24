import { useApolloClient, useQuery, useSubscription } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { setErrorMessage } from 'common/notification';
import { Button } from 'components/UI/Form/Button/Button';
import { EmptyState } from 'components/UI/EmptyState/EmptyState';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { SegmentedControl } from 'components/UI/SegmentedControl/SegmentedControl';
import { GOLDEN_QA_LIST_VARIABLES, LIST_AI_EVALUATIONS, LIST_GOLDEN_QA } from 'graphql/queries/AIEvaluations';
import { AI_EVALUATION_UPDATED } from 'graphql/subscriptions/AIEvaluations';
import DocumentIcon from 'assets/images/icons/Document/Dark.svg?react';
import type { EvaluationListData, EvaluationRun, EvaluationSubTab } from 'containers/AIEvaluation/types/evaluationType';
import { isRunInProgress, mergeEvaluationUpdate } from 'containers/AIEvaluation/utils/evaluation/evaluation';
import type { GoldenQaSet } from 'containers/AIEvaluation/types/goldenQaType';
import { AddGoldenQaSetDialog, ManageGoldenQaSetsDialog, ViewGoldenQaSetDialog } from './GoldenQA';
import { EvaluationHistory } from './EvaluationHistory/EvaluationHistory';
import { RunEvaluationDialog } from './RunEvaluationDialog/RunEvaluationDialog';
import { RunPanel } from './RunPanel/RunPanel';
import styles from './Evaluation.module.css';

const RUN_LIST_VARIABLES = { filter: {}, opts: { order: 'DESC', orderWith: 'inserted_at' } };

export interface EvaluationProps {
  assistantId?: string;
  versionId?: string;
  liveVersionId?: string;
  versionNumber?: number;
  assistantName?: string;
}

export const Evaluation = ({
  assistantId,
  versionId,
  liveVersionId,
  versionNumber,
  assistantName,
}: EvaluationProps) => {
  const { t } = useTranslation();

  const [subTab, setSubTab] = useState<EvaluationSubTab>('run');
  const [manageOpen, setManageOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [viewing, setViewing] = useState<GoldenQaSet | null>(null);
  const [runOpen, setRunOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery(LIST_GOLDEN_QA, {
    variables: GOLDEN_QA_LIST_VARIABLES,
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: runData,
    error: runsError,
    refetch: refetchRuns,
  } = useQuery<EvaluationListData>(LIST_AI_EVALUATIONS, {
    variables: RUN_LIST_VARIABLES,
    fetchPolicy: 'cache-and-network',
  });

  const client = useApolloClient();

  useSubscription(AI_EVALUATION_UPDATED, {
    onError: (subscriptionError) => setErrorMessage(subscriptionError, t('Could not listen for evaluation updates')),
    onData: ({ data: subscription }) => {
      const updated: EvaluationRun | undefined = subscription?.data?.aiEvaluationUpdated;
      if (!updated) return;

      client.cache.updateQuery<EvaluationListData>(
        { query: LIST_AI_EVALUATIONS, variables: RUN_LIST_VARIABLES },
        (previous) => mergeEvaluationUpdate(previous ?? undefined, updated)
      );

      refetchRuns();
    },
  });

  const sets: GoldenQaSet[] = data?.goldenQas ?? [];
  const assistantRuns: EvaluationRun[] = (runData?.aiEvaluations ?? []).filter(
    (run: EvaluationRun) => !assistantId || run.assistantConfigVersion?.assistant?.id === assistantId
  );
  const versionRuns = assistantRuns.filter((run) => run.assistantConfigVersion?.id === versionId);
  const latestRun = versionRuns[0];
  const runsInProgress = assistantRuns.some(isRunInProgress);

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

  if (error && sets.length === 0) {
    return (
      <div data-testid="evaluationTab">
        <EmptyState
          testId="goldenQaLoadError"
          icon={<ErrorOutlineIcon fontSize="inherit" />}
          title={t('Golden Q&A sets could not be loaded')}
          note={t('The server did not answer. Check your connection and try again.')}
          action={
            <Button variant="outlined" onClick={() => refetch()} data-testid="retryGoldenQaButton">
              {t('Try again')}
            </Button>
          }
        />
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <div data-testid="evaluationTab">
        <EmptyState
          testId="goldenQaEmpty"
          icon={<DocumentIcon />}
          title={t('Add a Golden Q&A set to evaluate this assistant')}
          note={t(
            'A fixed set of questions and their ideal answers. Every version is scored against the same set, so results stay comparable.'
          )}
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setAddOpen(true)}
              data-testid="addFirstSetButton"
            >
              {t('Add a Golden Q&A set')}
            </Button>
          }
        />
        {addDialog}
      </div>
    );
  }

  if (runsError && assistantRuns.length === 0) {
    return (
      <div data-testid="evaluationTab">
        <EmptyState
          testId="evaluationRunsLoadError"
          icon={<ErrorOutlineIcon fontSize="inherit" />}
          title={t('Evaluation runs could not be loaded')}
          note={t('The server did not answer. Check your connection and try again.')}
          action={
            <Button variant="outlined" onClick={() => refetchRuns()} data-testid="retryRunsButton">
              {t('Try again')}
            </Button>
          }
        />
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
              disabled={!versionId || runsInProgress}
              title={runsInProgress ? t('An evaluation is already running. Wait for it to finish.') : undefined}
              onClick={() => setRunOpen(true)}
              data-testid="runEvaluationButton"
            >
              {latestRun ? t('Run another evaluation') : t('Run evaluation')}
            </Button>
          </div>
        )}
      </div>

      {subTab === 'run' ? (
        <RunPanel run={latestRun} versionNumber={versionNumber} onGoToHistory={() => setSubTab('history')} />
      ) : assistantRuns.length > 0 ? (
        <EvaluationHistory runs={assistantRuns} liveVersionId={liveVersionId} />
      ) : (
        <EmptyState
          testId="evaluationHistoryEmpty"
          title={t('No evaluations yet')}
          note={t(
            'Once you run an evaluation, every run shows up here so you can compare versions and Golden Q&A sets.'
          )}
          action={
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
          }
        />
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
