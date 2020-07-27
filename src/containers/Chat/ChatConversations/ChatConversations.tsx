import React, { useState } from 'react';
import { Typography, Toolbar, Container } from '@material-ui/core';
import styles from './ChatConversations.module.css';
import { SearchBar } from './SearchBar';
import selectedChatIcon from '../../../assets/images/icons/Chat/Selected.svg';
import ConversationList from './ConversationList/ConversationList';
import SavedSearchToolbar from '../../SavedSearch/SavedSearchToolbar/SavedSearchToolbar';

export interface ChatConversationsProps {
  contactId: number;
}

export const ChatConversations: React.SFC<ChatConversationsProps> = (props) => {
  // get the conversations stored from the cache
  const [searchVal, setSearchVal] = useState('');
  const [selectedContactId, setSelectedContactId] = useState(props.contactId);
  const [savedSearchCriteria, setSavedSearchCriteria] = useState<string>('');

  const handleChange = (event: any) => {
    setSearchVal(event.target.value);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    let searchVal = event.target.searchInput.value.trim();
    setSearchVal(searchVal);
  };

  const resetSearch = () => {
    setSearchVal('');
  };

  const handlerSavedSearchCriteria = (criteria: string) => {
    setSavedSearchCriteria(criteria);
  };

  return (
    <Container className={styles.ChatConversations} disableGutters>
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
      <SavedSearchToolbar savedSearchCriteriaCallback={handlerSavedSearchCriteria} />
      <SearchBar
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        onReset={() => resetSearch()}
        searchVal={searchVal}
      />
      <ConversationList
        searchVal={searchVal}
        selectedContactId={selectedContactId}
        setSelectedContactId={(i: number) => {
          setSelectedContactId(i);
        }}
        savedSearchCriteria={savedSearchCriteria}
      />
    </Container>
  );
};

export default ChatConversations;
