import React from 'react';
import { Typography } from '@material-ui/core';

export interface ChatConversationsProps {}

export const ChatConversations: React.SFC<ChatConversationsProps> = () => {
  return <Typography variant="h6">Chat Conversations here!</Typography>;
};

export default ChatConversations;
