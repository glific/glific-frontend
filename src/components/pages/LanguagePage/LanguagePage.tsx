import React from 'react';
import { LanguageList } from '../../../containers/Language/LanguageList/LanguageList';

export interface LanguagePageProps {
  contactId: string;
}

export const LanguagePage: React.SFC<LanguagePageProps> = ({ contactId }) => {
  return (
    <div>
      <LanguageList />
    </div>
  );
};
