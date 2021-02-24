import React from 'react';
import { CircularProgress, Typography } from '@material-ui/core';

import styles from './Loading.module.css';

export interface LoadingProps {
  message?: string;
}

export const Loading: React.SFC<LoadingProps> = ({ message = 'Loading...' }) => (
  <div className={styles.CenterItems} data-testid="loader">
    <div className={styles.LoadingPadding}>
      <CircularProgress />
    </div>
    <Typography variant="h5">{message}</Typography>
  </div>
);

export default Loading;
