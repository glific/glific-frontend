import React from 'react';
import { Typography, ListItemText, ListItem, List } from '@material-ui/core';

import ChatConversation from './ChatConversation/ChatConversation';
import styles from './ChatConversations.module.css';

export interface ChatConversationsProps {
  //TO FIX: define clear type once this is hooked with backend
  conversations: any;
  selectedConversation: number;
}

export const ChatConversations: React.SFC<ChatConversationsProps> = (props) => {
  let conversationList;

  if (props.conversations.length > 0) {
    conversationList = props.conversations.map((conversation: any) => {
      return (
        <ChatConversation
          key={conversation.contactId}
          contactId={conversation.contactId}
          contactName={conversation.contactName}
          lastMessage={conversation.messages[0].content}
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
      <Typography variant="h6">Chats</Typography>
      <br />
      <input type="text" placeholder="type to search" />
      <List>
        {conversationList}
      </List>
    </div>
  );
};

export default ChatConversations;
