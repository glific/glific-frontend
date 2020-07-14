import React, { useState, useCallback } from 'react';
import { Typography, List, Toolbar, Container } from '@material-ui/core';
import ChatConversation from './ChatConversation/ChatConversation';
import styles from './ChatConversations.module.css';
import Loading from '../../../components/UI/Layout/Loading/Loading';
import { SearchBar } from './SearchBar';
import { GET_CONVERSATION_QUERY, FILTER_CONVERSATIONS_QUERY } from '../../../graphql/queries/Chat';
import { useApolloClient, useLazyQuery, useQuery } from '@apollo/client';
import selectedChatIcon from '../../../assets/images/icons/Chat/Selected.svg';
import { ConversationList } from './ConversationList';

export interface ChatConversationsProps {}

export const ChatConversations: React.SFC<ChatConversationsProps> = () => {
  const [searchVal, setSearchVal] = useState('');
  const handleChange = (event: any) => {
    setSearchVal(event.target.value);
  };

  const handleSearch = (event: any) => {
    setSearchVal(event.target.value);
  };

  const resetSearch = () => {
    setSearchVal('');
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
        handleChange={handleChange}
        onReset={resetSearch}
        searchVal={searchVal}
      />
      <ConversationList searchVal={searchVal} />
    </Container>
  );
};

export default ChatConversations;
