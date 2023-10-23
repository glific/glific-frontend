import SpeedSendIcon from 'assets/images/icons/SpeedSend/Selected.svg?react';
import Template from '../Template';
import styles from './SpeedSend.module.css';

const speedSendIcon = <SpeedSendIcon className={styles.SpeedSendIcon} />;

export const SpeedSend = () => (
  <Template
    listItemName="Speed send"
    redirectionLink="speed-send"
    icon={speedSendIcon}
    customStyle={styles.AttachmentFields}
    languageStyle="bar"
  />
);

export default SpeedSend;
