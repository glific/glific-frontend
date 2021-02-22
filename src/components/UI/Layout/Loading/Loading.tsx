import React from 'react';
import { CircularProgress, Typography } from '@material-ui/core';

import styles from './Loading.module.css';

export interface LoadingProps {
  massage?: string;
}

export const Loading: React.SFC<LoadingProps> = (props) => {
  const { massage = 'Loading...' } = props;
  return (
    <div className={styles.CenterItems} data-testid="loader">
      <div className={styles.LoadingPadding}>
        <CircularProgress />
      </div>
      <Typography variant="h5">{massage}</Typography>
    </div>
  );
};

export default Loading;
