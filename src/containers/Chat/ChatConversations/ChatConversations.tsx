import React from 'react';
import { Typography, List, Toolbar, Container } from '@material-ui/core';
import { useQuery, InMemoryCache } from '@apollo/client';

import ChatConversation from './ChatConversation/ChatConversation';
import styles from './ChatConversations.module.css';
import { GET_CONVERSATION_QUERY } from '../../../graphql/queries/Chat';
import gqlClient from '../../../config/apolloclient';

export interface ChatConversationsProps {}

export const ChatConversations: React.SFC<ChatConversationsProps> = () => {
  // get the conversations stored from the cache
  const queryVariables = {
    contactOpts: {
      limit: 50,
    },
    filter: {},
    messageOpts: {
      limit: 100,
    },
  };

  const data: any = gqlClient.readQuery({
    query: GET_CONVERSATION_QUERY,
    variables: queryVariables,
  });

  let conversations = data.conversations;

  // build the conversation list only if there are conversations
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
    conversationList = <p data-testid="empty-result">You do not have any conversations.</p>;
  }

  // render the component
  return (
    <Container className={styles.ChatConversations} disableGutters>
      <Toolbar>
        <Typography variant="h6">Chats</Typography>
      </Toolbar>
      <Container className={styles.ListingContainer} disableGutters>
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
