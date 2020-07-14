import React, { useState, useCallback } from 'react';
import { Typography, List, Toolbar, Container } from '@material-ui/core';
import ChatConversation from './ChatConversation/ChatConversation';
import styles from './ChatConversations.module.css';
import Loading from '../../../components/UI/Layout/Loading/Loading';
import { SearchBar } from './SearchBar';
import { GET_CONVERSATION_QUERY, FILTER_CONVERSATIONS_QUERY } from '../../../graphql/queries/Chat';
import { useApolloClient, useLazyQuery, useQuery } from '@apollo/client';
import selectedChatIcon from '../../../assets/images/icons/Chat/Selected.svg';

export interface ChatConversationsProps {}

export const ChatConversations: React.SFC<ChatConversationsProps> = () => {
  // get the conversations stored from the cache
  // create an instance of apolloclient
  const client = useApolloClient();
  const [searchVal, setSearchVal] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0); // This won't work all the time, if the default chat opened is not at index 0. (see ChatMessage for similar behavior).

  const queryVariables = {
    contactOpts: {
      limit: 50,
    },
    filter: {},
    messageOpts: {
      limit: 100,
    },
  };

  const filterVariables = () => {
    return {
      term: searchVal,
      messageOpts: {
        limit: 10,
      },
      contactOpts: {
        limit: 10,
      },
    };
  };

  const data: any = client.readQuery({
    query: GET_CONVERSATION_QUERY,
    variables: queryVariables,
  });

  const { loading, error, data: searchData, refetch, fetchMore, updateQuery } = useQuery<any>(
    FILTER_CONVERSATIONS_QUERY,
    {
      variables: filterVariables(),
    }
  );

  const getNewSearch = useCallback((prevResult: any, newData: any) => {
    return newData.search;
  }, []);

  // Other cases
  if (loading) return <Loading />;
  if (error) return <p>Error :(</p>;

  if (data === undefined) {
    return <p>Error :(</p>;
  }

  // Retrieving all convos or the ones searched by.
  let conversations = data.conversations;

  if (searchVal) {
    // && called) {
    conversations = searchData.search.filter((n: any) => n.__typename === 'Conversation'); // Trying to only get conversation types from search query.
  }

  // build the conversation list only if there are conversations
  let conversationList;
  if (conversations.length > 0) {
    conversationList = conversations.map((conversation: any, index: number) => {
      let lastMessage = [];
      if (conversation.messages.length > 0) {
        lastMessage = conversation.messages[0];
      }
      return (
        <ChatConversation
          key={conversation.contact.id}
          selected={selectedIndex === index}
          onClick={(i: number) => setSelectedIndex(i)}
          index={index}
          contactId={conversation.contact.id}
          contactName={
            conversation.contact.name ? conversation.contact.name : conversation.contact.phone
          }
          lastMessage={lastMessage}
        />
      );
    });
  } else {
    conversationList = <p data-testid="empty-result">You do not have any conversations.</p>;
  }

  const handleSearch = (e: any) => {
    return 'nothing';
    e.preventDefault();
    let searchVal = e.target.searchInput.value.trim();
    setSearchVal(searchVal);
    // if (!called) {
    //   queryFilterConvos();
    //   return <Loading />;
    // }
    setSelectedIndex(-1);
  };

  const handleChange = (e: any) => {
    console.log(e.target.value);
    setSearchVal(e.target.value);
    // queryFilterConvos();
    // if (refetch) {
    //   console.log('refetch exists');
    // }
    // if (updateQuery) {
    //   console.log('updatequery exists');
    // }
    // refetch(filterVariables());
    fetchMore({
      query: FILTER_CONVERSATIONS_QUERY,
      variables: filterVariables(),
      updateQuery: (prev, { fetchMoreResult }) => {
        console.log(prev);
        console.log(fetchMoreResult);
        return getNewSearch(prev, fetchMoreResult);
        // return updateConversations(prev, subscriptionData, 'RECEIVED');
      },
    });
    // } else {
    //   console.log('cant find fetchmore');
    // }
    // return <Loading />;
    setSelectedIndex(-1);
  };

  const resetSearch = () => {
    setSearchVal('');
    setSelectedIndex(-1);
  };

  console.log('reset component');

  return (
    <Container className={styles.ChatConversations} disableGutters>
      {/* Styling toolbar for design */}
      <Toolbar style={{ padding: '0 24px 0 12px' }}>
        <div className={styles.IconBackground}>
          <img src={selectedChatIcon} height="24" className={styles.Icon} alt="Conversation" />
        </div>
        <div className={styles.Title}>
          <Typography
            style={{
              fontFamily: 'Heebo, Sans-Serif',
              fontSize: '24px',
              color: '#073F24',
              marginTop: '3px',
            }}
            variant="h6"
          >
            Chats
          </Typography>
        </div>
      </Toolbar>
      <SearchBar
        handleSubmit={handleSearch}
        handleChange={handleChange}
        onReset={resetSearch}
        searchVal={searchVal}
      />
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
