import styles from './Loading.module.css';
import { useContext, useEffect, useState } from 'react';
import { RandomValueContext } from 'context/session';
import productTips from '../../../../../productTips';

export interface LoadingProps {
  message?: string;
}

export const Loading = ({ message }: LoadingProps) => {
  const { randomValue } = useContext(RandomValueContext);
  const [loader, setLoader] = useState('.');

  useEffect(() => {
    let isUnmounted = false;
    let dots = '';

    const updateLoader = () => {
      if (!isUnmounted) {
        dots = dots === '...' ? '.' : dots + '.';
        setLoader(dots);
        setTimeout(updateLoader, 200);
      }
    };

    updateLoader();

    return () => {
      isUnmounted = true;
    };
  }, []);

  var messageToDisplay = productTips.length > 0 ? productTips[randomValue] : ' ';

  return (
    <div className={styles.LoadingDiv} data-testid="loader">
      <div className={styles.LoadingInnerDiv}>
        {messageToDisplay}
        <br/>
        {loader}
      </div>
    </div>
  );
};

export default Loading;
