import React from 'react';
import { Typography } from '@material-ui/core';
import { ContactBar } from './ContactBar/ContactBar';
import { ChatMessage } from './ChatMessage/ChatMessage';

export interface ChatMessagesProps {}

export const ChatMessages: React.SFC<ChatMessagesProps> = () => {
  return (
    <Typography variant="h6">
      <ContactBar />
      <ChatMessage />
    </Typography>
  );
};

export default ChatMessages;
