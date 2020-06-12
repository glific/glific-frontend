import React from 'react';
import { Typography, List, Toolbar, Container } from '@material-ui/core';
import { History } from 'history';
import { gql, useQuery } from '@apollo/client';

import ChatConversation from './ChatConversation/ChatConversation';
import styles from './ChatConversations.module.css';

export interface ChatConversationsProps {
  //history: History;
}

const GET_CONVERSATION_QUERY = gql`
query conversations($nc: Int!, $sc: Int!) {
  conversations(numberOfConversations: $nc, sizeOfConversations: $sc) {
    contact {
      id
      name
    }
    messages {
      id
      body
    }
  }
}
`;

export const ChatConversations: React.SFC<ChatConversationsProps> = () => {
  const { loading, error, data } = useQuery<any>(GET_CONVERSATION_QUERY, {
    variables: {
      "nc": 20,
      "sc": 3
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  if (data === undefined || data.conversations === undefined) {
    return null;
  }

  let conversations = data.conversations;

  let conversationList;
  console.log(conversations)
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
