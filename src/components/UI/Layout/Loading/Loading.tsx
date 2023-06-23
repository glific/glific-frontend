import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import styles from './Loading.module.css';
import YamlContent from '../../../../../loadingMessages.yml';
import { useContext, useEffect, useState } from 'react';
import { RandomValueContext } from 'context/session';

// console.log(YamlContent?.messages_for_loading[0]);

export interface LoadingProps {
  message?: string;
}

export const Loading = ({ message }: LoadingProps) => {
  const { randomValue } = useContext(RandomValueContext);
  // const index = Math.floor(Math.random() * 10);
  const [loader, setLoader] = useState('');

  useEffect(() => {
    const timeOut = setTimeout(() => {
      if (loader.length >= 6) {
        setLoader(' .');
      } else {
        setLoader((prev) => prev + ' .');
      }
    }, 100);
    return () => clearInterval(timeOut);
  }, [loader]);

  // console.log("index",index*10);
  const { t } = useTranslation();
  const messageToDisplay = YamlContent?.messages_for_loading[randomValue] || t('Loading...');

  return (
    <div className={styles.CenterItems} data-testid="loader">
      <Typography variant="h6" className={styles.LoadingText}>
        {messageToDisplay+loader}
      </Typography>
    </div>
  );
};

export default Loading;
