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
import { debounce } from 'ts-debounce';

export interface ChatConversationsProps {}

export const ChatConversations: React.SFC<ChatConversationsProps> = () => {
  const [searchVal, setSearchVal] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleChange = (event: any) => {
    // debounce(() => setSearchVal(event.target.value), 250);
    setSearchVal(event.target.value);
  };

  const resetSearch = () => {
    setSearchVal('');
  };

  console.log(selectedIndex);

  return (
    <Container className={styles.ChatConversations} disableGutters>
      {/* Styling toolbar for design */}
      <Toolbar className={styles.ToolBar}>
        <div className={styles.IconBackground}>
          <img src={selectedChatIcon} height="24" className={styles.Icon} alt="Conversation" />
        </div>
        <div className={styles.Title}>
          <Typography className={styles.TitleText} variant="h6">
            Chats
          </Typography>
        </div>
      </Toolbar>
      <SearchBar
        // handleSubmit={handleSearch}
        handleChange={handleChange}
        onReset={resetSearch}
        searchVal={searchVal}
      />
      <ConversationList
        searchVal={searchVal}
        selectedIndex={selectedIndex}
        setSelectedIndex={(i: number) => {
          // console.log(i);
          setSelectedIndex(i);
        }}
      />
    </Container>
  );
};

export default ChatConversations;
