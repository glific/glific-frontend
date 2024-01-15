import SpeedSendIcon from 'assets/images/icons/SpeedSend/Dark.svg?react';
import Template from '../Template';
import styles from './SpeedSendList.module.css';

export const SpeedSendList = () => {
  const speedSendIcon = <SpeedSendIcon className={styles.SpeedSendIcon} />;

  return (
    <Template
      title="Speed sends"
      listItem="sessionTemplates"
      listItemName="speed send"
      pageLink="speed-send"
      listIcon={speedSendIcon}
      filters={{ isHsm: false }}
    />
  );
};

export default SpeedSendList;
