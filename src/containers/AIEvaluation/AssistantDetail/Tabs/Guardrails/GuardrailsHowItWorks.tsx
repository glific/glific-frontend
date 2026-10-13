import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import BlockIcon from '@mui/icons-material/Block';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import EastIcon from '@mui/icons-material/East';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import type {
  GuardrailAction,
  GuardrailFlowStep,
  GuardrailFlowStepIcon,
} from 'containers/AIEvaluation/types/guardrailType';
import { GUARDRAIL_ACTION_LABEL } from './guardrailsData';
import styles from './Guardrails.module.css';

const STEP_ICON = {
  message: ChatBubbleOutlineIcon,
  guard: ShieldOutlinedIcon,
  assistant: SmartToyOutlinedIcon,
  reply: KeyboardReturnIcon,
} satisfies Record<GuardrailFlowStepIcon, typeof ChatBubbleOutlineIcon>;

const ACTION_ICON = {
  fix: AutorenewIcon,
  block: BlockIcon,
} satisfies Record<GuardrailAction, typeof AutorenewIcon>;

const FLOWS = {
  fix: {
    description: 'The conversation continues as normal — only the flagged part is hidden or reworded.',
    steps: [
      { icon: 'message', label: 'User message', tone: 'neutral', reachedBy: 'none' },
      { icon: 'guard', label: 'Flagged part hidden / reworded', tone: 'action', reachedBy: 'arrow' },
      { icon: 'assistant', label: 'AI assistant answers as usual', tone: 'neutral', reachedBy: 'arrow' },
    ],
  },
  block: {
    description:
      'The conversation is stopped — the AI assistant never sees the message. The user gets your set reply instead.',
    steps: [
      { icon: 'message', label: 'User message', tone: 'neutral', reachedBy: 'none' },
      { icon: 'guard', label: 'Guard stops it', tone: 'action', reachedBy: 'arrow' },
      { icon: 'assistant', label: 'AI assistant', tone: 'skipped', reachedBy: 'stopped' },
      { icon: 'reply', label: 'Your set reply is sent to the user', tone: 'action', reachedBy: 'arrow' },
    ],
  },
} as const satisfies Record<GuardrailAction, { description: string; steps: readonly GuardrailFlowStep[] }>;

const ACTIONS: GuardrailAction[] = ['fix', 'block'];

export const GuardrailsHowItWorks = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.HowItWorks} data-testid="guardrailsHowItWorks">
      {ACTIONS.map((action) => {
        const ActionIcon = ACTION_ICON[action];
        const flow = FLOWS[action];

        return (
          <div className={`${styles.FlowCard} ${styles[action]}`} key={action} data-testid={`guardrailsFlow-${action}`}>
            <div className={styles.FlowHeader}>
              <span className={styles.FlowTitle}>
                <ActionIcon className={styles.FlowTitleIcon} />
                {t(GUARDRAIL_ACTION_LABEL[action])}
              </span>
              <span className={styles.FlowDescription}>{t(flow.description)}</span>
            </div>

            <div className={styles.FlowSteps}>
              {flow.steps.map((step) => {
                const StepIcon = STEP_ICON[step.icon];
                return (
                  <Fragment key={step.label}>
                    {step.reachedBy === 'arrow' && <EastIcon className={styles.FlowArrow} />}
                    {step.reachedBy === 'stopped' && (
                      <span className={styles.FlowStopped}>
                        <CloseIcon className={styles.FlowStoppedIcon} />
                      </span>
                    )}
                    <div className={`${styles.FlowStep} ${styles[step.tone]}`}>
                      <span className={styles.FlowStepIcon}>
                        <StepIcon />
                      </span>
                      <span className={styles.FlowStepLabel}>{t(step.label)}</span>
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className={styles.HowItWorksNote}>
        {t(
          "Guardrails on the assistant's replies work the same way — they either fix the reply before it's sent, or replace it with your set reply."
        )}
      </div>
    </div>
  );
};

export default GuardrailsHowItWorks;
