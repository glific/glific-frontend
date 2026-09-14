import { useQuery } from '@apollo/client';

import { PresenceIndicator } from 'components/UI/PresenceIndicator/PresenceIndicator';
import { GET_CONTACT_WEB_PRESENCE } from 'graphql/queries/Contact';

const POLL_INTERVAL_MS = 30000;

export interface WebPresenceProps {
  entityId: string;
}

// The web channel has no 24 hour session window, so the session timer a WhatsApp conversation
// shows would be meaningless here. Whether the person still has the widget open is the
// equivalent thing staff need to know before they type.
//
// Polled rather than subscribed: presence is ephemeral server state with no subscription, and a
// value read once when the conversation opened would silently age while staff looked at it.
export const WebPresence = ({ entityId }: WebPresenceProps) => {
  const { data } = useQuery(GET_CONTACT_WEB_PRESENCE, {
    variables: { id: entityId },
    pollInterval: POLL_INTERVAL_MS,
    fetchPolicy: 'network-only',
  });

  return <PresenceIndicator testId="webPresence" online={Boolean(data?.contact?.contact?.isWebOnline)} />;
};

export default WebPresence;
