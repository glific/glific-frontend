import { useTranslation } from 'react-i18next';

import styles from './BetaTag.module.css';

export interface BetaTagProps {
  label?: string;
  size?: 'small' | 'big';
  className?: string;
}

export const BetaTag = ({ label, size = 'big', className }: BetaTagProps) => {
  const { t } = useTranslation();

  return (
    <span
      className={`${styles.BetaTag} ${size === 'small' ? styles.Small : styles.Big} ${className || ''}`}
      data-testid="beta-tag"
    >
      {label ?? t('Beta')}
    </span>
  );
};

export default BetaTag;
