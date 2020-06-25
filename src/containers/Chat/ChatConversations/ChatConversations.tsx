import React, { useState, useEffect } from 'react';
import { Typography, List, Toolbar, Container } from '@material-ui/core';
import { useQuery } from '@apollo/client';

import ChatConversation from './ChatConversation/ChatConversation';
import styles from './ChatConversations.module.css';
import { GET_CONVERSATION_QUERY, FILTER_CONVERSATIONS_QUERY } from '../../../graphql/queries/Chat';
import Loading from '../../../components/UI/Layout/Loading/Loading';
import { SearchBar } from './SearchBar';

export interface ChatConversationsProps {}

export const ChatConversations: React.SFC<ChatConversationsProps> = () => {
  const [searchVal, setSearchVal] = useState('');

  // Not sure if this is a refetch for other filtered data, or if I should change the query structure all together.
  // const { loading, error, data, refetch } = useQuery<any>(GET_CONVERSATION_QUERY, {
  //   variables: {
  //     contactOpts: {
  //       limit: 20,
  //     },
  //     filter: {},
  //     messageOpts: {
  //       limit: 1,
  //     },
  //   },
  // });

  const {
    loading: loadingFilter,
    error: errorFilter,
    data: dataFilter,
    refetch: refetchFilter,
  } = useQuery<any>(FILTER_CONVERSATIONS_QUERY, {
    variables: {
      term: '',
      opts: {
        limit: 10,
      },
    },
  });

  useEffect(() => {
    console.log('changed');
    console.log('searchval', searchVal);
    refetchFilter({
      term: searchVal,
      opts: {
        limit: 10,
      },
    });
  }, [searchVal]);

  // if (loading) return <Loading />;
  // if (error) return <p>Error :(</p>;

  // if (data === undefined || data.conversations === undefined) {
  //   return null;
  // }

  if (loadingFilter) return <Loading />;
  if (errorFilter) return <p>Error :(</p>;

  if (dataFilter === undefined || dataFilter.search === undefined) {
    return null;
  }

  // Constructing ChatConversation objects for conversations with at least one message.
  let conversationList;
  if (dataFilter.search.length > 0) {
    conversationList = dataFilter.search.reduce((filtered: Array<any>, conversation: any) => {
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

  // console.log('convo list', conversationList);

  // Change this line with the new data endpoint.
  // let conversationList;
  // if (conversations.length > 0) {
  //   conversationList = conversations.map((conversation: any) => {
  //     return (
  //       <ChatConversation
  //         key={conversation.contact.id}
  //         contactId={conversation.contact.id}
  //         contactName={conversation.contact.name}
  //         lastMessage={conversation.messages[0]}
  //       />
  //     );
  //   });
  // } else {
  //   conversationList = <p data-testid="empty-result">You do not have any conversations.</p>;
  // }

  const handleSearch = (e: any) => {
    e.preventDefault();
    let searchVal = e.target.searchInput.value.trim();
    setSearchVal(searchVal);
  };

  return (
    <Container className={styles.ChatConversations}>
      <Toolbar>
        <Typography variant="h6">Chats</Typography>
        {/* Adding search/filter functionality for different messages */}
        <SearchBar handleSubmit={handleSearch} onReset={() => setSearchVal('')} />
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
