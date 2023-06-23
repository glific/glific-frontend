import { Typography } from '@mui/material';
import styles from './Loading.module.css';
import YamlContent from '../../../../../productTips.yml';
import { useContext, useEffect, useState } from 'react';
import { RandomValueContext } from 'context/session';

export interface LoadingProps {
  message?: string;
}

export const Loading = ({ message }: LoadingProps) => {
  const { randomValue } = useContext(RandomValueContext);
  const [loader, setLoader] = useState('');

  useEffect(() => {
    let isUnmounted = false;
    let dots = '';

    const updateLoader = () => {
      if (!isUnmounted) {
        dots = dots === '...' ? '' : dots + '.';
        setLoader(dots);
        setTimeout(updateLoader, 100);
      }
    };

    updateLoader();

    return () => {
      isUnmounted = true;
    };
  }, []);

  const messageToDisplay = YamlContent?.messages_for_loading[randomValue];

  return (
    <div className={styles.CenterItems} data-testid="loader">
      <Typography variant="h6" className={styles.LoadingText}>
        {messageToDisplay+loader}
      </Typography>
    </div>
  );
};

export default Loading;
