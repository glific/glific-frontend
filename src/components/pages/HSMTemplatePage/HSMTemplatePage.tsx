import React from 'react';
import { HSMList } from '../../../containers/Template/HSM/HSMList/HSMList';

export interface HSMTemplatePageProps {}

const HSMTemplatePage: React.SFC<HSMTemplatePageProps> = () => {
  return (
    <div>
      <HSMList />
    </div>
  );
};

export default HSMTemplatePage;
