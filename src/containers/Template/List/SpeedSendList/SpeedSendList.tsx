import React from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as SpeedSendIcon } from 'assets/images/icons/SpeedSend/Dark.svg';
import Template from '../Template';
import styles from './SpeedSendList.module.css';

export const SpeedSendList = () => {
  const { t } = useTranslation();
  const speedSendIcon = <SpeedSendIcon className={styles.SpeedSendIcon} />;

  return (
    <Template
      title="Speed sends"
      listItem="sessionTemplates"
      listItemName="speed send"
      pageLink="speed-send"
      listIcon={speedSendIcon}
      filters={{ isHsm: false }}
      buttonLabel={t('Create Speed Send')}
    />
  );
};

export default SpeedSendList;
