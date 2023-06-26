import styles from './Loading.module.css';
import YamlContent from '../../../../../productTips.yml';
import { useContext, useEffect, useState } from 'react';
import { RandomValueContext } from 'context/session';

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

  var messageToDisplay = YamlContent?.messages_for_loading ? YamlContent?.messages_for_loading[randomValue]+" ":"Loading ";

  useEffect(()=>{
    if(YamlContent?.messages_for_loading){
      messageToDisplay = YamlContent?.messages_for_loading[randomValue];
    }
  },[YamlContent?.messages_for_loading,randomValue]);

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
