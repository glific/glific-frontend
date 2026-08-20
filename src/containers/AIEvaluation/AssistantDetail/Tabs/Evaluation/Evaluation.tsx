import { useQuery } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Button } from 'components/UI/Form/Button/Button';
import { EmptyState } from 'components/UI/EmptyState/EmptyState';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { SegmentedControl } from 'components/UI/SegmentedControl/SegmentedControl';
import { GOLDEN_QA_LIST_VARIABLES, LIST_GOLDEN_QA } from 'graphql/queries/AIEvaluations';
import DocumentIcon from 'assets/images/icons/Document/Dark.svg?react';
import type { EvaluationSubTab } from 'containers/AIEvaluation/types/evaluationType';
import type { GoldenQaSet } from 'containers/AIEvaluation/types/goldenQaType';
import { AddGoldenQaSetDialog, ManageGoldenQaSetsDialog, ViewGoldenQaSetDialog } from './GoldenQA';
import styles from './Evaluation.module.css';

/** stands in for the tab name while the sentence around the link is split */
const TAB_SLOT = '\u0000';

export interface EvaluationProps {
  versionNumber?: number;
}

export const Evaluation = ({ versionNumber }: EvaluationProps) => {
  const { t } = useTranslation();

  const [subTab, setSubTab] = useState<EvaluationSubTab>('run');
  const [manageOpen, setManageOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [viewing, setViewing] = useState<GoldenQaSet | null>(null);

  const { data, loading, error, refetch } = useQuery(LIST_GOLDEN_QA, {
    variables: GOLDEN_QA_LIST_VARIABLES,
    fetchPolicy: 'cache-and-network',
  });

  const sets: GoldenQaSet[] = data?.goldenQas ?? [];

  const footNote = t('See every past run in the {{tab}} tab', { tab: TAB_SLOT }).split(TAB_SLOT);

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

  return (
    <div data-testid="evaluationTab">
      <SegmentedControl<EvaluationSubTab>
        className={styles.SubTabs}
        optionClassName={styles.SubTabOption}
        testId="evaluationSubTabs"
        options={[
          { value: 'run', label: t('Run') },
          { value: 'history', label: t('History') },
        ]}
        value={subTab}
        onChange={setSubTab}
      />

      {subTab === 'run' ? (
        <>
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
              disabled
              title={t('Running evaluations is not available yet.')}
              data-testid="runEvaluationButton"
            >
              {t('Run evaluation')}
            </Button>
          </div>

          <EmptyState
            testId="noEvaluationsYet"
            title={
              versionNumber
                ? t('No evaluations yet for version {{version}}', { version: versionNumber })
                : t('No evaluations yet for this version')
            }
            note={t('Run one to see how this version scores against a Golden Q&A set.')}
          />

          <div className={styles.FootNote}>
            {footNote[0]}
            <button
              type="button"
              className={styles.FootNoteLink}
              onClick={() => setSubTab('history')}
              data-testid="goToHistoryButton"
            >
              {t('History')}
            </button>
            {footNote[1]}
          </div>
        </>
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
