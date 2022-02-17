import React from 'react';

import styles from './StatusBar.module.css';

export interface StatusBarProps {}

export const StatusBar: React.FC<StatusBarProps> = () => {
  const walletBalance = 0.99;

  let statusMessage;
  if (walletBalance < 1 && walletBalance > 0) {
    statusMessage =
      'Please recharge your Gupshup wallet immediately to continue sending messages. Users will not receive the messages that get stuck during this time.';
  } else if (walletBalance <= 0) {
    statusMessage =
      'All the outgoing messages have been suspended. Please note: on recharging, the messages that were stuck will not be sent.';
  }

  const limitReached = false;

  if (limitReached) {
    statusMessage =
      'You have reached today’s rate limit for sending HSM templates to your users. Your rate limit will be refreshed tomorrow. Please check again later.';
  }

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
