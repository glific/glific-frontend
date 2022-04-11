import React from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as TemplateIcon } from 'assets/images/icons/Template/UnselectedDark.svg';
import styles from './HSMList.module.css';
import { Template } from '../Template';

export interface HSMListProps {}

export const HSMList: React.FC<HSMListProps> = () => {
  const { t } = useTranslation();
  const templateIcon = <TemplateIcon className={styles.TemplateIcon} />;

  return (
    <Template
      title="Templates"
      listItem="sessionTemplates"
      listItemName="HSM Template"
      pageLink="template"
      listIcon={templateIcon}
      filters={{ isHsm: true }}
      isHSM
      buttonLabel={t('+ Create HSM Template')}
    />
  );
};

export default HSMList;
