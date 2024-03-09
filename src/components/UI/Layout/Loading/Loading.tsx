import { useState } from 'react';
import { CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { productTips } from './ProductTip';
import styles from './Loading.module.css';

export interface LoadingProps {
  message?: string;
  showTip?: boolean;
  whiteBackground?: boolean;
}

export const Loading = ({ message, showTip = false, whiteBackground = false }: LoadingProps) => {
  const { t } = useTranslation();
  const messageToDisplay = message || t('Loading...');
  const [selectedTip] = useState(() => productTips[Math.floor(Math.random() * productTips.length)]);

  return (
    <>
      {showTip ? (
        <div className={styles.LoadingWithTip} data-testid="loader">
          <div className={styles.LoadingCircularProgress}>
            <CircularProgress />
          </div>
          <div className={styles.TipBackground}>
            <div className={styles.TipHeading}>PRO TIPS</div>
            <Typography className={styles.TipBody}>{selectedTip}</Typography>
          </div>
        </div>
      ) : (
        <div
          className={`${styles.CenterItems} ${whiteBackground && styles.WhiteBackground}`}
          data-testid="loader"
        >
          <div className={styles.LoadingPadding}>
            <CircularProgress />
          </div>
          <Typography variant="h5">{messageToDisplay}</Typography>
        </div>
      )}
    </>
  );
};
