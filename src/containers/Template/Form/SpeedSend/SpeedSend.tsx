import React from 'react';

import { ReactComponent as SpeedSendIcon } from 'assets/images/icons/SpeedSend/Selected.svg';
import Template from '../Template';
import styles from './SpeedSend.module.css';

export interface SpeedSendProps {
  match: any;
}

const speedSendIcon = <SpeedSendIcon className={styles.SpeedSendIcon} />;

export const SpeedSend: React.SFC<SpeedSendProps> = ({ match }) => (
  <Template
    match={match}
    listItemName="Speed send"
    redirectionLink="speed-send"
    icon={speedSendIcon}
    customStyle={styles.AttachmentFields}
    languageStyle="bar"
  />
);

export default SpeedSend;
