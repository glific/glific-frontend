import React, { useState, useEffect } from 'react';
import { Typography, List, Toolbar, Container } from '@material-ui/core';

import ChatConversation from './ChatConversation/ChatConversation';
import styles from './ChatConversations.module.css';
import { FILTER_CONVERSATIONS_QUERY } from '../../../graphql/queries/Chat';
import Loading from '../../../components/UI/Layout/Loading/Loading';
import { SearchBar } from './SearchBar';
import { GET_CONVERSATION_QUERY } from '../../../graphql/queries/Chat';
import { useApolloClient } from '@apollo/client';

export interface ChatConversationsProps {}

export const ChatConversations: React.SFC<ChatConversationsProps> = () => {
  const [searchVal, setSearchVal] = useState('');

  // const { loading, error, data, refetch } = useQuery<any>(FILTER_CONVERSATIONS_QUERY, {
  //   variables: {
  //     term: '',
  //     shouldSave: true,
  //     searchLabel: '',
  //     messageOpts: {
  //       limit: 10,
  //     },
  //     contactOpts: {
  //       limit: 10, // Doesn't work atm.
  //     },
  //   },
  // });

  // useEffect(() => {
  //   refetch({
  //     term: searchVal,
  //     opts: {
  //       limit: 10,
  //     },
  //   });
  // }, [searchVal]);

  // if (loading) return <Loading />;
  // if (error) return <p>Error :(</p>;

  // if (data === undefined || data.search === undefined) {
  //   return null;
  // }

  // // Constructing ChatConversation objects for conversations with at least one message.
  // let conversationList;
  // if (data.search.length > 0) {
  //   conversationList = data.search.reduce((filtered: Array<any>, conversation: any) => {
  //     if (conversation.messages.length > 0) {
  //       return filtered.concat(
  //         <ChatConversation
  //           key={conversation.contact.id}
  //           contactId={conversation.contact.id}
  //           contactName={conversation.contact.name}
  //           lastMessage={conversation.messages[0]}
  //         />
  //       );
  //     }
  //     return filtered;
  //   }, []);
  // get the conversations stored from the cache
  // create an instance of apolloclient
  const client = useApolloClient();

  const queryVariables = {
    contactOpts: {
      limit: 50,
    },
    filter: {},
    messageOpts: {
      limit: 100,
    },
  };

  const data: any = client.readQuery({
    query: GET_CONVERSATION_QUERY,
    variables: queryVariables,
  });

  let conversations = data.conversations;

  // build the conversation list only if there are conversations
  let conversationList;
  if (conversations.length > 0) {
    conversationList = conversations.map((conversation: any, index: number) => {
      return (
        <ChatConversation
          key={conversation.contact.id}
          conversationIndex={index}
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
