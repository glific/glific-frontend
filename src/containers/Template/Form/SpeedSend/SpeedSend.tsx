import React from 'react';

import styles from './SpeedSend.module.css';
import { ReactComponent as SpeedSendIcon } from '../../../../assets/images/icons/SpeedSend/Selected.svg';
import Template from '../Template';

export interface SpeedSendProps {
  match: any;
}

const speedSendIcon = <SpeedSendIcon className={styles.SpeedSendIcon} />;

export const SpeedSend: React.SFC<SpeedSendProps> = ({ match }) => {
  return (
    <Template
      match={match}
      listItemName="speed send"
      redirectionLink="speed-send"
      icon={speedSendIcon}
    />
  );
};
