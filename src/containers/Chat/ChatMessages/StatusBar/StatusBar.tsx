import React from 'react';

import styles from './StatusBar.module.css';

export interface StatusBarProps {}

export const StatusBar: React.FC<StatusBarProps> = () => {
  const showStatusMessage = true;

  if (showStatusMessage) {
    return <div className={styles.statusMessage}>Status message goes here</div>;
  }

  return null;
};
