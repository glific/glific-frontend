import { t } from 'i18next';

import styles from './BetaTag.module.css';

export interface BetaTagProps {
  label?: string;
  size?: 'small' | 'big';
  className?: string;
}

export const BetaTag = ({ label = t('Beta'), size = 'big', className }: BetaTagProps) => (
  <span
    className={`${styles.BetaTag} ${size === 'small' ? styles.Small : styles.Big} ${className || ''}`}
    data-testid="beta-tag"
  >
    {label}
  </span>
);

export default BetaTag;
