import React, { useState } from 'react';
import { Container } from '@material-ui/core';

import styles from './CollectionConversations.module.css';
import { SearchBar } from '../../../components/UI/SearchBar/SearchBar';
import { ConversationList } from '../ChatConversations/ConversationList/ConversationList';

export interface CollectionConversationsProps {
  groupId?: number;
}

const CollectionConversations: React.SFC<CollectionConversationsProps> = (props) => {
  const { groupId } = props;
  const [searchVal, setSearchVal] = useState('');
  const [searchParam, setSearchParam] = useState<any>({});
  const [selectedGroupId, setSelectedGroupId] = useState<any>(groupId);

  const resetSearch = () => {
    setSearchVal('');
  };

  const handleChange = (event: any) => {
    if (event.target.param) {
      setSearchParam(event.target.param);
    }
    setSearchVal(event.target.value);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const searchValInput = event.target.querySelector('input').value.trim();
    setSearchVal(searchValInput);
  };

  return (
    <Container className={styles.CollectionConversations} disableGutters>
      <SearchBar
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        onReset={() => resetSearch()}
        searchVal={searchVal}
        // handleClick={handleClick}
        endAdornment
        searchMode={false}
      />
      <ConversationList
        searchVal={searchVal}
        searchMode={false}
        searchParam={searchParam}
        selectedGroupId={selectedGroupId}
        setSelectedContactId={(i: number) => {
          setSelectedGroupId(i);
        }}
      />
    </Container>
  );
};

export default CollectionConversations;
