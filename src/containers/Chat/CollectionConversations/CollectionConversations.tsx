import React, { useState } from 'react';
import { Container } from '@material-ui/core';

import styles from './CollectionConversations.module.css';
import { ConversationList } from '../ChatConversations/ConversationList/ConversationList';

export interface CollectionConversationsProps {
  collectionId?: number | null;
}

const CollectionConversations: React.SFC<CollectionConversationsProps> = (props) => {
  const { collectionId } = props;
  const [selectedCollectionId, setSelectedCollectionId] = useState<any>(collectionId);

  return (
    <Container className={styles.CollectionConversations} disableGutters>
      <ConversationList
        searchVal=""
        searchMode={false}
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
