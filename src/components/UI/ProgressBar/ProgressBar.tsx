import { LinearProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  /**
   * Caption rendered under the bar and used as the accessible name. Say what is running
   * ("Rewriting for utility…"), not just "Loading".
   */
  label?: string;
  className?: string;
  testId?: string;
}

/**
 * Indeterminate progress bar for an in-flight action whose duration is unknown.
 * There is deliberately no determinate mode — add one only when a real percentage exists.
 */
export const ProgressBar = ({ label, className, testId = 'progress-bar' }: ProgressBarProps) => {
  const { t } = useTranslation();

  return (
    <div className={`${styles.Wrap} ${className ?? ''}`} data-testid={testId}>
      <LinearProgress
        variant="indeterminate"
        aria-label={label || t('Loading...')}
        classes={{ root: styles.Bar, bar: styles.BarIndicator }}
      />
      {label && <span className={styles.Label}>{label}</span>}
    </div>
  );
};

export default ProgressBar;
