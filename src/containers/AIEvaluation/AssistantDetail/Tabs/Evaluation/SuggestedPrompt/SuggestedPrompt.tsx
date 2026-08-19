import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button } from 'components/UI/Form/Button/Button';
import { setErrorMessage, setNotification } from 'common/notification';
import { IMPROVE_EVALUATION_PROMPT } from 'graphql/mutations/AIEvaluations';
import type { EvaluationMetrics } from 'containers/AIEvaluation/types/evaluationType';
import { MAX_SCORE, formatScore, scoreBand } from 'containers/AIEvaluation/utils/evaluation/evaluation';
import styles from './SuggestedPrompt.module.css';

export interface SuggestedPromptProps {
  runId: string;
  overall: number;
  metrics: EvaluationMetrics;
}

const WEAKNESS = [
  {
    key: 'groundTruth',
    label: 'adherence to ground truth',
    reason: 'Answers drift from the ideal answers on facts.',
  },
  {
    key: 'knowledgeBase',
    label: 'adherence to knowledge base',
    reason: 'Some replies invent detail not in your documents.',
  },
  {
    key: 'prompt',
    label: 'adherence to prompt',
    reason: 'Tone directives slip on edge cases.',
  },
] as const satisfies readonly { key: keyof EvaluationMetrics; label: string; reason: string }[];

export const SuggestedPrompt = ({ runId, overall, metrics }: SuggestedPromptProps) => {
  const { t } = useTranslation();

  const [dismissed, setDismissed] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);

  const [improvePrompt, { loading }] = useMutation(IMPROVE_EVALUATION_PROMPT);

  const scored = WEAKNESS.filter((entry) => metrics[entry.key] != null);
  const weakest = [...scored].sort((a, b) => (metrics[a.key] as number) - (metrics[b.key] as number))[0];

  const heading = <div className={styles.ZoneTitle}>{t('What to change next')}</div>;

  if (scoreBand(overall) === 'good' || !weakest) {
    return (
      <div className={styles.Zone} data-testid="suggestedPromptNone">
        {heading}
        <div className={`${styles.Card} ${styles.Settled}`}>
          <CheckCircleOutlineIcon className={styles.SettledIcon} />
          <div>{t("Nothing to change — this run scores well. Publish it when you're ready.")}</div>
        </div>
      </div>
    );
  }

  if (dismissed) {
    return (
      <div className={styles.Zone} data-testid="suggestedPromptDismissed">
        {heading}
        <div className={`${styles.Card} ${styles.Settled}`}>
          <div className={styles.DismissedText}>
            <div className={styles.CardTitle}>{t('Suggestion dismissed')}</div>
            <div className={styles.Note}>{t('Kept until this version is evaluated again.')}</div>
          </div>
          <Button
            variant="outlined"
            className={styles.GhostButton}
            onClick={() => setDismissed(false)}
            data-testid="restoreSuggestionButton"
          >
            {t('Restore')}
          </Button>
        </div>
      </div>
    );
  }

  const applyChange = async () => {
    try {
      const { data } = await improvePrompt({ variables: { evaluationId: runId } });

      const errors = data?.improveEvaluationPrompt?.errors;
      if (errors?.length) {
        setErrorMessage(errors[0]);
        return;
      }

      setNotification(t('Prompt improvement started — the new version appears here once it is ready.'));
    } catch (error: unknown) {
      setErrorMessage(error);
    }
  };

  return (
    <div className={styles.Zone} data-testid="suggestedPrompt">
      <div className={styles.ZoneHead}>
        {heading}
        <div className={styles.ZoneSub}>{t('Rewrites the prompt for the check this run scored lowest on')}</div>
      </div>

      <div className={styles.Card}>
        <div className={styles.CardTitle}>
          <AutoAwesomeIcon className={styles.Sparkle} />
          {t('Suggested prompt change')}
        </div>
        <div className={styles.Reason}>{t(weakest.reason)}</div>

        <button
          type="button"
          className={styles.Why}
          onClick={() => setWhyOpen((open) => !open)}
          data-testid="whyThisChangeButton"
        >
          {t('Why this change?')}
          {whyOpen ? <ExpandLessIcon className={styles.WhyCaret} /> : <ExpandMoreIcon className={styles.WhyCaret} />}
        </button>

        {whyOpen && (
          <div className={styles.WhyBox} data-testid="whyThisChange">
            {t('Targets your weakest check')} — <b>{t(weakest.label)}</b> {t('at')} {formatScore(metrics[weakest.key])}/
            {MAX_SCORE}.
          </div>
        )}

        <div className={styles.Actions}>
          <Button
            variant="contained"
            color="primary"
            className={styles.ApplyButton}
            loading={loading}
            disabled={loading}
            onClick={applyChange}
            data-testid="applySuggestionButton"
          >
            {t('Apply and save a new version')}
          </Button>
          <Button
            variant="outlined"
            className={styles.GhostButton}
            disabled={loading}
            onClick={() => setDismissed(true)}
            data-testid="dismissSuggestionButton"
          >
            {t('Not now')}
          </Button>
        </div>
      </div>
    </div>
  );
};
