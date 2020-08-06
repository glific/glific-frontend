import React from 'react';

import styles from './HSM.module.css';
import { ReactComponent as TemplateIcon } from '../../../../assets/images/icons/Template/Selected.svg';
import Template from '../Template';

export interface HSMProps {
  match: any;
}

const defaultAttribute = {
  isHsm: true,
};

const templateIcon = <TemplateIcon className={styles.TemplateIcon} />;

export const HSM: React.SFC<HSMProps> = ({ match }) => {
  return (
    <Template
      match={match}
      listItemName="HSM Template"
      redirectionLink="template"
      icon={templateIcon}
      defaultAttribute={defaultAttribute}
    />
  );
};
