import React from 'react';
import { CircularProgress, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import styles from './Loading.module.css';

export interface LoadingProps {
  message?: string;
}

export const Loading: React.SFC<LoadingProps> = ({ message }) => {
  const { t } = useTranslation();
  const messageToDisplay = message || t('Loading...');

  return (
    <div className={styles.CenterItems} data-testid="loader">
      <div className={styles.LoadingPadding}>
        <CircularProgress />
      </div>
      <Typography variant="h5">{messageToDisplay}</Typography>
    </div>
  );
};

export default Loading;
