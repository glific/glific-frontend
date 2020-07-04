import React from 'react';
import { Paper } from '@material-ui/core';
import { MessageTemplateList } from '../../../containers/MessageTemplate/MessageTemplateList/MessageTemplateList';

import styles from './MessageTemplatePage.module.css';

export interface MessageTemplatePageProps {}

const MessageTemplatePage: React.SFC<MessageTemplatePageProps> = () => {
  return (
    <div>
      <MessageTemplateList />
    </div>
  );
};

export default MessageTemplatePage;
