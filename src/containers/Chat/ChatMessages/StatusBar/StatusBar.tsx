import { useQuery } from '@apollo/client';

import { getUserSession } from 'services/AuthService';
import { BSPBALANCE, GET_ORGANIZATION_STATUS } from 'graphql/queries/Organization';
import styles from './StatusBar.module.css';
import { GET_WA_MANAGED_PHONES_STATUS } from 'graphql/queries/WaGroups';
import { useLocation } from 'react-router';

const StatusBar = () => {
  const location = useLocation();
  const variables = { organizationId: getUserSession('organizationId') };

  // get gupshup balance
  const { data: orgStatus } = useQuery(GET_ORGANIZATION_STATUS);

  const { data: balanceData } = useQuery(BSPBALANCE, {
    variables,
    fetchPolicy: 'cache-only',
  });

  const { data } = useQuery(GET_WA_MANAGED_PHONES_STATUS);
  const hasInactivePhone = data?.waManagedPhones?.some((phone: any) => phone.status !== 'active');

  if (!balanceData && !orgStatus) {
    return null;
  }

  let statusMessage;

  if (orgStatus && orgStatus.organization.organization.isSuspended) {
    statusMessage =
      'You have reached today’s rate limit for sending HSM templates to your users. Your rate limit will be refreshed tomorrow. Please check again later.';
  } else if (balanceData) {
    const { balance } = JSON.parse(balanceData.bspbalance);
    if (balance < 1 && balance > 0) {
      statusMessage =
        'Please recharge your Gupshup wallet immediately to continue sending messages. Users will not receive the messages that get stuck during this time.';
    } else if (balance <= 0) {
      statusMessage =
        'All the outgoing messages have been suspended. Please note: on recharging, the messages that were stuck will not be sent.';
    } else if (hasInactivePhone && location.pathname.includes('group')) {
      statusMessage =
        'One or more of your phones are not active. Please check the status of your phones to ensure smooth message delivery.';
    }
  }

  if (statusMessage) {
    return (
      <div data-testid="status-bar" className={styles.StatusMessage}>
        <span className={styles.StatusTitle}>Attention! </span>
        {statusMessage}
      </div>
    );
  }

  return null;
};

export default StatusBar;
