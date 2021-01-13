import React, { useState } from 'react';
import { Container } from '@material-ui/core';

import styles from './CollectionConversations.module.css';
import { ConversationList } from '../ChatConversations/ConversationList/ConversationList';

export interface CollectionConversationsProps {
  groupId?: number | null;
}

const CollectionConversations: React.SFC<CollectionConversationsProps> = (props) => {
  const { groupId } = props;
  const [selectedGroupId, setSelectedGroupId] = useState<any>(groupId);

  return (
    <Container className={styles.CollectionConversations} disableGutters>
      <ConversationList
        searchVal=""
        searchMode={false}
        selectedGroupId={selectedGroupId}
        setSelectedGroupId={(i: number) => {
          setSelectedGroupId(i);
        }}
      />
    </Container>
  );
};

export default CollectionConversations;
