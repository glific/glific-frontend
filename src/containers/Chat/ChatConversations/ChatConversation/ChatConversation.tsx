import React from 'react';

export interface ChatConversationProps {
  contactName: string;
  lastMessage: string;
  conversationId: number;
}

const ChatConversation: React.SFC<ChatConversationProps> = (props) => {
  return (
    <div>
      <div>{props.contactName}</div>
      <div>{props.lastMessage}</div>
    </div>
  );
};

export default ChatConversation;
