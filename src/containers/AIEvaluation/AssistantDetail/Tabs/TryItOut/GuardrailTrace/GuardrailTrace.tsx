import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import GppMaybeOutlinedIcon from '@mui/icons-material/GppMaybeOutlined';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import type { TranslationKey } from 'containers/AIEvaluation/types/guardrailType';
import type {
  GuardrailCheck,
  GuardrailTraceProps,
  GuardrailTraceStageProps,
} from 'containers/AIEvaluation/types/sandboxType';
import styles from './GuardrailTrace.module.css';

const CHECK_TITLE: Record<string, TranslationKey> = {
  PIIRemover: 'Privacy Protection',
  LexicalSlur: 'Content Safety',
  TopicRelevanceLLM: 'Scope Control',
  GenderAssumptionBias: 'Gender Neutrality',
};

const isFlagged = (check: GuardrailCheck) => check.outcome !== 'PASS';

const Stage = ({ title, before, after, checks, testId }: GuardrailTraceStageProps) => {
  const { t } = useTranslation();
  if (checks.length === 0 && before.text === null && after.text === null) return null;

  const changed = after.text !== null && after.text !== before.text;

  return (
    <div className={styles.Stage} data-testid={testId}>
      <div className={styles.StageTitle}>{title}</div>

      {before.text !== null && (
        <div className={styles.TextRow}>
          <span className={styles.TextLabel}>{before.label}</span>
          <span className={styles.Text}>{before.text}</span>
        </div>
      )}
      {changed && (
        <div className={`${styles.TextRow} ${styles.Changed}`} data-testid={`${testId}-changed`}>
          <span className={styles.TextLabel}>{after.label}</span>
          <span className={styles.Text}>{after.text}</span>
        </div>
      )}

      {checks.map((check, index) => (
        <div className={styles.Check} key={`${check.name}-${index}`} data-testid="guardrailCheck">
          <span className={`${styles.Outcome} ${isFlagged(check) ? styles.Flagged : styles.Passed}`}>
            {isFlagged(check) ? t('Flagged') : t('Passed')}
          </span>
          <span className={styles.CheckName}>{CHECK_TITLE[check.name] ? t(CHECK_TITLE[check.name]) : check.name}</span>
          {check.error && <span className={styles.CheckError}>— {check.error}</span>}
        </div>
      ))}
    </div>
  );
};

export const GuardrailTrace = ({ trace }: GuardrailTraceProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const flagged = [...trace.inputChecks, ...trace.outputChecks].filter(isFlagged).length;

  return (
    <div className={styles.Trace} data-testid="guardrailTrace">
      <button
        type="button"
        className={`${styles.Toggle} ${flagged ? styles.ToggleFlagged : styles.TogglePassed}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        data-testid="guardrailTraceToggle"
      >
        {flagged ? (
          <GppMaybeOutlinedIcon className={styles.ShieldIcon} data-testid="guardrailTraceFlaggedIcon" />
        ) : (
          <GppGoodOutlinedIcon className={styles.ShieldIcon} data-testid="guardrailTracePassedIcon" />
        )}
        <span className={styles.ToggleTitle}>{t('Guardrails')}</span>
        <span className={styles.Summary}>
          · {flagged ? t('{{count}} flagged', { count: flagged }) : t('All checks passed')}
        </span>
        <ChevronRightIcon className={styles.Icon} />
      </button>

      {open && (
        <DialogBox
          title={t('Guardrails')}
          titleAlign="left"
          buttonOk={t('Done')}
          alignButtons="right"
          skipCancel
          handleOk={() => setOpen(false)}
          handleCancel={() => setOpen(false)}
        >
          <div className={styles.Body} data-testid="guardrailTraceBody">
            <Stage
              title={t('Incoming message')}
              before={{ label: t('User sent'), text: trace.inputFromUser }}
              after={{ label: t('Assistant received'), text: trace.inputToLlm }}
              checks={trace.inputChecks}
              testId="guardrailTraceInput"
            />
            <Stage
              title={t('Reply')}
              before={{ label: t('Assistant wrote'), text: trace.outputFromLlm }}
              after={{ label: t('User received'), text: trace.outputToUser }}
              checks={trace.outputChecks}
              testId="guardrailTraceOutput"
            />
          </div>
        </DialogBox>
      )}
    </div>
  );
};

export default GuardrailTrace;
