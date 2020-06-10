import React from 'react';
import { Typography } from '@material-ui/core';

import ChatConversation from './ChatConversation/ChatConversation';

const conversations = [
  {
    conversationId: 1,
    contactName: 'Jane Doe',
    lastMessage: 'Hello!',
  },
  {
    conversationId: 2,
    contactName: 'Peter Parker',
    lastMessage: 'Need Help',
  },
  {
    conversationId: 3,
    contactName: 'Luke Skywalker',
    lastMessage: 'Can I get Help',
  },
];

export interface ChatConversationsProps {}

export const ChatConversations: React.SFC<ChatConversationsProps> = () => {
  let conversationList;

  if (conversations.length > 0) {
    conversationList = conversations.map((conversation, index) => {
      return (
        <ChatConversation
          conversationId={conversation.conversationId}
          contactName={conversation.contactName}
          lastMessage={conversation.lastMessage}
        />
      );
    });
  } else {
    conversationList = <p>You do not have any conversations.</p>;
  }

  return (
    <div>
      <Typography variant="h6">Conversations</Typography>
      <input type="text" placeholder="type to search" />
      <div>{conversationList}</div>
    </div>
  );
};

export default ChatConversations;
