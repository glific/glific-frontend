import React from 'react';

import styles from './SpeedSendList.module.css';
import { ReactComponent as SpeedSendIcon } from '../../../../assets/images/icons/SpeedSend/Selected.svg';
import Template from '../Template';

export interface SpeedSendListProps {}

export const SpeedSendList: React.SFC<SpeedSendListProps> = () => {
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
