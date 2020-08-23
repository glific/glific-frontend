import React from 'react';
import { HSMList } from '../../../../containers/Template/List/HSMList/HSMList';

export interface HSMPageProps {}

export const HSMPage: React.SFC<HSMPageProps> = () => {
  return (
    <div>
      <HSMList />
    </div>
  );
};
