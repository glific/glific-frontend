import React from 'react';
import { Typography, List, Toolbar, Container } from '@material-ui/core';

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
          lastMessage={conversation.messages[0]}
        />
      );
    });
  } else {
    conversationList = <p>You do not have any conversations.</p>;
  }

  return (
    <Container className={styles.ChatConversations}>
      <Toolbar>
        <Typography variant="h6">Chats</Typography>
      </Toolbar>

      {/* 
      <input
        className={styles.InputBox}
        data-testid="message-input"
        type="text"
        placeholder="Search"
      // value={message}
      // onKeyPress={onKeyPress}
      // onChange={onChange}
      /> */}
      <Container className={styles.ListingContainer}>
        {conversationList ? (
          <List className={styles.StyledList}>{conversationList}</List>
        ) : (
          { conversationList }
        )}
      </Container>
    </Container>
  );
};

export default ChatConversations;
