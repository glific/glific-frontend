import React from 'react';
import { MessageTemplateList } from '../../../containers/MessageTemplate/MessageTemplateList/MessageTemplateList';

export interface MessageTemplatePageProps {}

const MessageTemplatePage: React.SFC<MessageTemplatePageProps> = () => {
  return (
    <div>
      <MessageTemplateList />
    </div>
  );
};

export default MessageTemplatePage;
