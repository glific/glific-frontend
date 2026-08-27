import { useTranslation } from 'react-i18next';
import styles from './LivePill.module.css';

export interface LivePillProps {
  className?: string;
}

export const LivePill = ({ className }: LivePillProps) => {
  const { t } = useTranslation();

  return (
    <span className={`${styles.LivePill} ${className ?? ''}`} data-testid="livePill">
      <span className={styles.LiveDot} />
      {t('LIVE')}
    </span>
  );
};
