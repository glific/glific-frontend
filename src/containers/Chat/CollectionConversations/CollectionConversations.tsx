import React, { useState } from 'react';
import { Container } from '@material-ui/core';

import SearchBar from 'components/UI/SearchBar/SearchBar';
import styles from './CollectionConversations.module.css';
import { ConversationList } from '../ChatConversations/ConversationList/ConversationList';

export interface CollectionConversationsProps {
  collectionId?: number | null;
}

const CollectionConversations: React.SFC<CollectionConversationsProps> = (props) => {
  const { collectionId } = props;
  const [selectedCollectionId, setSelectedCollectionId] = useState<any>(collectionId);
  const [searchVal, setSearchVal] = useState('');

  let timer: any;
  const handleSearchChange = (event: any) => {
    // wait for a second to avoid API call on each keyup event
    clearTimeout(timer);
    timer = setTimeout(() => setSearchVal(event.target.value), 1000);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const searchValInput = event.target.querySelector('input').value.trim();
    setSearchVal(searchValInput);
  };

  return (
    <Container className={styles.CollectionConversations} disableGutters>
      <div className={styles.SearchBar}>
        <SearchBar
          searchVal={searchVal}
          handleChange={handleSearchChange}
          handleSubmit={handleSubmit}
          onReset={() => setSearchVal('')}
          searchMode
        />
      </div>
      <ConversationList
        searchVal={searchVal}
        searchMode={false}
        searchParam={{}}
        selectedCollectionId={selectedCollectionId}
        setSelectedCollectionId={(i: number) => {
          setSelectedCollectionId(i);
        }}
        entityType="collection"
      />
    </Container>
  );
};

export default CollectionConversations;
