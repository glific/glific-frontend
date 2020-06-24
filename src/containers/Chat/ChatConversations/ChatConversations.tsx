import React, { useState, useEffect } from 'react';
import { Typography, List, Toolbar, Container } from '@material-ui/core';
import { useQuery } from '@apollo/client';

import ChatConversation from './ChatConversation/ChatConversation';
import styles from './ChatConversations.module.css';
import { GET_CONVERSATION_QUERY } from '../../../graphql/queries/Chat';
import Loading from '../../../components/UI/Layout/Loading/Loading';
import { SearchBar } from './SearchBar';

export interface ChatConversationsProps {}

export const ChatConversations: React.SFC<ChatConversationsProps> = () => {
  const [searchVal, setSearchVal] = useState('');

  // Not sure if this is a refetch for other filtered data, or if I should change the query structure all together.
  const { loading, error, data, refetch } = useQuery<any>(GET_CONVERSATION_QUERY, {
    variables: {
      count: 20,
      size: 1,
    },
  });

  useEffect(() => {
    console.log('search val changed');
  }, [searchVal]);

  if (loading) return <Loading />;
  if (error) return <p>Error :(</p>;

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
    conversationList = <p data-testid="empty-result">You do not have any conversations.</p>;
  }

  const handleSearch = (e: any) => {
    e.preventDefault();
    let searchVal = e.target.searchInput.value.trim();
    setSearchVal(searchVal);
  };

  const resetSearch = () => {
    console.log('resetting');
    setSearchVal('');
  };

  return (
    <Container className={styles.ChatConversations}>
      <Toolbar>
        <Typography variant="h6">Chats</Typography>
        {/* Adding search/filter functionality for different messages */}
        <SearchBar handleSubmit={handleSearch} onReset={resetSearch} searchVal={searchVal} />
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
