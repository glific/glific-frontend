import React from 'react';
import { useQuery } from '@apollo/client';

import styles from './GroupContact.module.css';
import { GroupContactList } from './GroupContactList/GroupContactList';
import { GroupDescription } from './GroupDescription/GroupDescription';
import { GET_GROUP } from '../../../graphql/queries/Group';

export interface GroupContactProps {
  match: any;
}

export const GroupContact: React.FC<GroupContactProps> = (props: GroupContactProps) => {
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
    <div className={styles.GroupContactContainer}>
      <div className={styles.ContactList}>
        <GroupContactList {...props} title={title} />
      </div>
      <div className={styles.GroupDescription}>
        <GroupDescription users={users} description={description} />
      </div>
    </div>
  );
};
