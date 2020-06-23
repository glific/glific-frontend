import React, { useState } from 'react';
import { Typography, List, Toolbar, Container } from '@material-ui/core';
import { useQuery } from '@apollo/client';

import ChatConversation from './ChatConversation/ChatConversation';
import styles from './ChatConversations.module.css';
import { GET_CONVERSATION_QUERY } from '../../../graphql/queries/Chat';
import { ToastMessage } from '../../../components/UI/ToastMessage/ToastMessage'

export interface ChatConversationsProps { }

export const ChatConversations: React.SFC<ChatConversationsProps> = () => {
  const [showError, setShowError] = useState(true);

  const { loading, error, data } = useQuery<any>(GET_CONVERSATION_QUERY, {
    variables: {
      count: 20,
      size: 3,
    },
  });

  const handleErrorClose = () => {
    setShowError(false);
  }

  if (loading) return <p>Loading...</p>;
  if (error && showError) return <ToastMessage
    open={true}
    severity='error'
    message={error?.message}
    handleClose={handleErrorClose}
    vertical='top'
    horizontal='center'
  />;

  if (data === undefined || data.conversations === undefined) {
    return null;
  }

  let conversations = data.conversations;

  let conversationList;
  if (conversations.length > 0) {
    conversationList = conversations.map((conversation: any) => {
      return (
        <ChatConversation
          key={conversation.contact.id}
          contactId={conversation.contact.id}
          contactName={conversation.contact.name}
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
