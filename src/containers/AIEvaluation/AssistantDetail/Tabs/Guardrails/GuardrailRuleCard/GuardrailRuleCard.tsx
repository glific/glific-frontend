import { useTranslation } from 'react-i18next';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import BlockIcon from '@mui/icons-material/Block';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Switch } from 'components/UI/Switch/Switch';
import type { GuardrailAction, GuardrailRuleCardProps } from 'containers/AIEvaluation/types/guardrailType';
import { GUARDRAIL_ACTION_LABEL } from 'containers/AIEvaluation/utils/guardrails/guardrails';
import styles from './GuardrailRuleCard.module.css';

const ACTION_ICON: Record<GuardrailAction, typeof AutorenewIcon> = {
  fix: AutorenewIcon,
  block: BlockIcon,
};

export const GuardrailRuleCard = ({
  id,
  number,
  title,
  description,
  link,
  action,
  enabled,
  onToggle,
  children,
}: GuardrailRuleCardProps) => {
  const { t } = useTranslation();
  const ActionIcon = ACTION_ICON[action];

  return (
    <div className={styles.Rule} data-testid={`guardrailRule-${id}`}>
      <div className={styles.RuleHeader}>
        <span className={styles.RuleNumber}>{number}</span>
        <div className={styles.RuleHeading}>
          <div className={styles.RuleTitleRow}>
            <span className={styles.RuleTitle}>{title}</span>
            <span className={`${styles.ActionBadge} ${styles[action]}`}>
              <ActionIcon className={styles.ActionIcon} />
              {t(GUARDRAIL_ACTION_LABEL[action])}
            </span>
          </div>
          <div className={styles.RuleDescription}>{description}</div>
          {enabled && children && <div className={styles.RuleBody}>{children}</div>}
        </div>
        <div className={styles.RuleControls}>
          {link && (
            <a
              className={styles.InfoLink}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`guardrailInfo-${id}`}
            >
              <InfoOutlinedIcon className={styles.InfoIcon} />
              {t('Info')}
            </a>
          )}
          <Switch checked={enabled} onChange={onToggle} ariaLabel={title} testId={`guardrailToggle-${id}`} />
        </div>
      </div>
    </div>
  );
};

export default GuardrailRuleCard;
