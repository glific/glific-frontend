import React, { useState, useEffect } from 'react';
import { Typography, List, Toolbar, Container } from '@material-ui/core';
import { useQuery } from '@apollo/client';

import ChatConversation from './ChatConversation/ChatConversation';
import styles from './ChatConversations.module.css';
import { FILTER_CONVERSATIONS_QUERY } from '../../../graphql/queries/Chat';
import Loading from '../../../components/UI/Layout/Loading/Loading';
import { SearchBar } from './SearchBar';

export interface ChatConversationsProps {}

export const ChatConversations: React.SFC<ChatConversationsProps> = () => {
  const [searchVal, setSearchVal] = useState('');

  const { loading, error, data, refetch } = useQuery<any>(FILTER_CONVERSATIONS_QUERY, {
    variables: {
      term: '',
      shouldSave: true,
      searchLabel: '',
      messageOpts: {
        limit: 10,
      },
      contactOpts: {
        limit: 10,
      },
    },
  });

  useEffect(() => {
    refetch({
      term: searchVal,
      opts: {
        limit: 10,
      },
    });
  }, [searchVal]);

  if (loading) return <Loading />;
  if (error) return <p>Error :(</p>;

  if (data === undefined || data.search === undefined) {
    return null;
  }

  // Constructing ChatConversation objects for conversations with at least one message.
  let conversationList;
  if (data.search.length > 0) {
    conversationList = data.search.reduce((filtered: Array<any>, conversation: any) => {
      if (conversation.messages.length > 0) {
        return filtered.concat(
          <ChatConversation
            key={conversation.contact.id}
            contactId={conversation.contact.id}
            contactName={conversation.contact.name}
            lastMessage={conversation.messages[0]}
          />
        );
      }
      return filtered;
    }, []);
  } else {
    conversationList = <p data-testid="empty-result">You do not have any conversations.</p>;
  }

  const handleSearch = (e: any) => {
    e.preventDefault();
    let searchVal = e.target.searchInput.value.trim();
    setSearchVal(searchVal);
  };

  return (
    <Container className={styles.ChatConversations} disableGutters>
      <Toolbar>
        <Typography variant="h6">Chats</Typography>
        {/* Adding search/filter functionality for different messages */}
        <SearchBar handleSubmit={handleSearch} onReset={() => setSearchVal('')} />
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
