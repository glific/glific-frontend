import styles from './Loading.module.css';
import { useContext, useEffect, useState } from 'react';
import { RandomValueContext } from 'context/session';
import * as yaml from 'js-yaml';

export interface LoadingProps {
  message?: string;
}

export const Loading = ({ message }: LoadingProps) => {
  const [productTips, setProductTips] = useState<Array<string>>([]);
  const { randomValue } = useContext(RandomValueContext);
  const [loader, setLoader] = useState('.');

  useEffect(() => {
    fetch('../../../../../productTips.yml')
      .then((response) => response.text())
      .then((fileContents) => {
        const loadedData: any = yaml.load(fileContents);
        setProductTips(loadedData?.messages_for_loading);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

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
        {loader}
      </div>
    </div>
  );
};

export default Loading;
