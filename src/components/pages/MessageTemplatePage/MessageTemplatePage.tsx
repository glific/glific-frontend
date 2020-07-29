import React from 'react';
import { SpeedSendList } from '../../../containers/Template/SpeedSend/SpeedSendList/SpeedSendList';

export interface MessageTemplatePageProps {}

const MessageTemplatePage: React.SFC<MessageTemplatePageProps> = () => {
  return (
    <div>
      <SpeedSendList />
    </div>
  );
};

export default MessageTemplatePage;
