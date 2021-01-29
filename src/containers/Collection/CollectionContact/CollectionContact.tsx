import React from 'react';
import { useQuery } from '@apollo/client';

import styles from './CollectionContact.module.css';
import { CollectionContactList } from './CollectionContactList/CollectionContactList';
import { CollectionDescription } from './CollectionDescription/CollectionDescription';
import { GET_GROUP } from '../../../graphql/queries/Group';

export interface CollectionContactProps {
  match: any;
}

export const CollectionContact: React.FC<CollectionContactProps> = (
  props: CollectionContactProps
) => {
  const { match } = props;

  const groupId = match.params.id;
  const group = useQuery(GET_GROUP, {
    variables: { id: groupId },
    fetchPolicy: 'cache-and-network',
  });
  const title = group.data ? group.data.group.group.label : 'Group';
  let users;
  let description;

  if (group.data) {
    users = group.data.group.group.users;
    description = group.data.group.group.description;
  }
  return (
    <div className={styles.CollectionContactContainer}>
      <div className={styles.ContactList}>
        <CollectionContactList {...props} title={title} />
      </div>
      <div className={styles.GroupDescription}>
        <CollectionDescription users={users} description={description} />
      </div>
    </div>
  );
};
