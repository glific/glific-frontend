import { useQuery } from '@apollo/client';

import { getUserSession } from 'services/AuthService';
import { BSPBALANCE } from 'graphql/queries/Organization';
import styles from './StatusBar.module.css';

const StatusBar = () => {
  const variables = { organizationId: getUserSession('organizationId') };

  // get gupshup balance
  const { data: balanceData } = useQuery(BSPBALANCE, {
    variables,
    fetchPolicy: 'cache-only',
  });

  if (!balanceData) {
    return null;
  }

  const { balance } = JSON.parse(balanceData.bspbalance);

  let statusMessage;
  if (balance < 1 && balance > 0) {
    statusMessage =
      'Please recharge your Gupshup wallet immediately to continue sending messages. Users will not receive the messages that get stuck during this time.';
  } else if (balance <= 0) {
    statusMessage =
      'All the outgoing messages have been suspended. Please note: on recharging, the messages that were stuck will not be sent.';
  }

  // TODOS: need to implement this once backend implements this feature
  // const limitReached = false;

  // if (limitReached) {
  //   statusMessage =
  //     'You have reached today’s rate limit for sending HSM templates to your users. Your rate limit will be refreshed tomorrow. Please check again later.';
  // }

  if (statusMessage) {
    return (
      <div className={styles.StatusMessage}>
        <span className={styles.StatusTitle}>Attention! </span>
        {statusMessage}
      </div>
    );
  }

  return null;
};

export default StatusBar;
