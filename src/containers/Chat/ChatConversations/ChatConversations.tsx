import React, { useState } from 'react';
import { Typography, List, Toolbar, Container } from '@material-ui/core';
import ChatConversation from './ChatConversation/ChatConversation';
import styles from './ChatConversations.module.css';
import Loading from '../../../components/UI/Layout/Loading/Loading';
import { SearchBar } from './SearchBar';
import { GET_CONVERSATION_QUERY, FILTER_CONVERSATIONS_QUERY } from '../../../graphql/queries/Chat';
import { useApolloClient, useLazyQuery } from '@apollo/client';
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

  const [queryFilterConvos, { called, loading, error, data: searchData }] = useLazyQuery<any>(
    FILTER_CONVERSATIONS_QUERY,
    {
      variables: filterVariables(),
    }
  );

  // Other cases
  if (loading) return <Loading />;
  if (error) return <p>Error :(</p>;

  if (data === undefined) {
    return <p>Error :(</p>;
  }

  // Retrieving all convos or the ones searched by.
  let conversations = data.conversations;

  if (searchVal && called) {
    conversations = searchData.search.filter((n: any) => n.__typename === 'Conversation'); // Trying to only get conversation types from search query.
  }

  // build the conversation list only if there are conversations
  let conversationList;
  if (conversations.length > 0) {
    conversationList = conversations.map((conversation: any, index: number) => {
      let lastMeessage = [];
      if (conversation.messages.length > 0) {
        lastMeessage = conversation.messages[0];
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
          lastMessage={lastMeessage}
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
    if (!called) {
      queryFilterConvos();
      return <Loading />;
    }
    setSelectedIndex(-1);
  };

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
        onReset={() => setSearchVal('')}
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
