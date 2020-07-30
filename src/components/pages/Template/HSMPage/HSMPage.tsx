import React from 'react';
import { HSMList } from '../../../../containers/Template/HSM/HSMList/HSMList';

export interface HSMPageProps {}

export const HSMPage: React.SFC<HSMPageProps> = () => {
  return (
    <div>
      <HSMList />
    </div>
  );
};
