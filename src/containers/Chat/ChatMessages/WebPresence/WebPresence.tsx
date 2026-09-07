import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { GET_CONTACT_WEB_PRESENCE } from 'graphql/queries/Contact';
import styles from './WebPresence.module.css';

const POLL_INTERVAL_MS = 30000;

export interface WebPresenceProps {
  entityId: string;
}

// The web channel has no 24 hour session window, so the session timer a WhatsApp conversation
// shows would be meaningless here. Whether the person still has the widget open is the
// equivalent thing staff need to know before they type.
export const WebPresence = ({ entityId }: WebPresenceProps) => {
  const { t } = useTranslation();

  const { data } = useQuery(GET_CONTACT_WEB_PRESENCE, {
    variables: { id: entityId },
    pollInterval: POLL_INTERVAL_MS,
    fetchPolicy: 'network-only',
  });

  const online = Boolean(data?.contact?.contact?.isWebOnline);

  return (
    <div className={styles.Presence} data-testid="webPresence">
      {online ? t('Online') : t('Offline')}
      <span className={`${styles.Dot} ${online ? styles.Online : styles.Offline}`} aria-hidden="true" />
    </div>
  );
};

export default WebPresence;
