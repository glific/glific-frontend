import React from 'react';
import { HSMList } from '../../../../containers/Template/HSM/HSMList/HSMList';

export interface HSMPageProps {}

const HSMTemplatePage: React.SFC<HSMPageProps> = () => {
  return (
    <div>
      <HSMList />
    </div>
  );
};

export default HSMTemplatePage;
