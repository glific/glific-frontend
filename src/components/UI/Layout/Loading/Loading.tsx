import { CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import styles from './Loading.module.css';
import { useContext } from 'react';
import { SelectedTipContext } from 'context/session';

export interface LoadingProps {
  message?: string;
  showTip?: boolean;
}

export const Loading = ({ message, showTip = false }: LoadingProps) => {
  const { selectedtip } = useContext(SelectedTipContext);
  const { t } = useTranslation();
  const messageToDisplay = message || t('Loading...');

  return (
    <>
      {showTip ? (
        <div className={styles.LoadingWithTip} data-testid="loader">
          <div style={{padding:"12px 0"}}>
            <CircularProgress />
          </div>
          <div className={styles.tipBackground}>
            <div className={styles.tipHeading}>Pro tips</div>
            <div className={styles.tipBody}>
              {selectedtip}
            </div>
          </div>
        </div>
      ):
      (
        <div className={styles.CenterItems} data-testid="loader">
          <div className={styles.LoadingPadding}>
            <CircularProgress />
          </div>
          <Typography variant="h5">{messageToDisplay}</Typography>
        </div>
      )
      }
    </>
  );
};

export default Loading;
