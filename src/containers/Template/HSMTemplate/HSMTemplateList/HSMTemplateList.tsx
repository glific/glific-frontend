import React from 'react';

import styles from './HSMTemplateList.module.css';
import { ReactComponent as TemplateIcon } from '../../../../assets/images/icons/Template/UnselectedDark.svg';
import { Template } from '../../Template';

export interface HSMPageProps {}

export const HSMTemplateList: React.SFC<HSMPageProps> = () => {
  const templateIcon = <TemplateIcon className={styles.TemplateIcon} />;
  const dialogMessage = 'It will stop showing when you are drafting a customized message';

  return (
    <Template
      title="Templates"
      listItem="sessionTemplates"
      listItemName="HSM Template"
      pageLink="template"
      listIcon={templateIcon}
      dialogMessage={dialogMessage}
      filters={{ isHsm: true }}
    />
  );
};
