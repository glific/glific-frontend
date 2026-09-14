import { useTranslation } from 'react-i18next';

import styles from './PresenceIndicator.module.css';

export interface PresenceIndicatorProps {
  online?: boolean;
  testId?: string;
}

// Presentational only, so a list can render one per row from data it already has rather than
// asking the server per contact. The open conversation's own indicator polls; see WebPresence.
export const PresenceIndicator = ({ online = false, testId = 'presenceIndicator' }: PresenceIndicatorProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.Presence} data-testid={testId}>
      {online ? t('Online') : t('Offline')}
      <span className={`${styles.Dot} ${online ? styles.Online : styles.Offline}`} aria-hidden="true" />
    </div>
  );
};

export default PresenceIndicator;
