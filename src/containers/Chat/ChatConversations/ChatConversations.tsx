import React from 'react';
import { Typography, ListItemText, ListItem, List } from '@material-ui/core';

import ChatConversation from './ChatConversation/ChatConversation';
import styles from './ChatConversations.module.css';

const conversations = [
  {
    contactId: 1,
    contactName: 'Jane Doe',
    lastMessage: 'Hello!',
  },
  {
    contactId: 2,
    contactName: 'Peter Parker',
    lastMessage: 'Need Help',
  },
  {
    contactId: 3,
    contactName: 'Luke Skywalker',
    lastMessage: 'Can I get Help',
  },
];

export interface ChatConversationsProps { }

export const ChatConversations: React.SFC<ChatConversationsProps> = () => {
  let conversationList;

  if (conversations.length > 0) {
    conversationList = conversations.map((conversation) => {
      return (
        <ChatConversation
          key={conversation.contactId}
          contactId={conversation.contactId}
          contactName={conversation.contactName}
          lastMessage={conversation.lastMessage}
        />
      );
    });
  } else {
    conversationList =
      <ListItem>
        <ListItemText
          secondary={'You do not have any conversations.'}
        />
      </ListItem >
  }

  return (
    <div className={styles.ChatConversations}>
      <Typography variant="h6">Conversations</Typography>
      <input type="text" placeholder="type to search" />
      <List>
        {conversationList}
      </List>
    </div>
  );
};

export default ChatConversations;
