import React from 'react';
import { HSMTemplateList } from '../../../containers/Template/HSMTemplate/HSMTemplateList/HSMTemplateList/HSMTemplateList';

export interface HSMTemplatePageProps {}

const HSMTemplatePage: React.SFC<HSMTemplatePageProps> = () => {
  return (
    <div>
      <HSMTemplateList />
    </div>
  );
};

export default HSMTemplatePage;
