import React from 'react';

import styles from './MessageTemplateList.module.css';
import { ReactComponent as SpeedSendIcon } from '../../../../assets/images/icons/SpeedSend/Selected.svg';
import Template from '../../Template';

export interface TemplateListProps {}

const speedSendIcon = <SpeedSendIcon className={styles.SpeedSendIcon} />;
const dialogMessage = ' It will stop showing when you are drafting a customized message';

export const MessageTemplateList: React.SFC<TemplateListProps> = () => (
  <Template
    title="Speed sends"
    listItem="sessionTemplates"
    listItemName="speed send"
    pageLink="speed-send"
    listIcon={speedSendIcon}
    dialogMessage={dialogMessage}
    filters={{ isHsm: false }}
  />
);
