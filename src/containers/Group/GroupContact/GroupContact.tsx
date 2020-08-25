import React from 'react';
import { GroupContactList } from './GroupContactList/GroupContactList';
import styles from './GroupContact.module.css';
import { GroupDescription } from './GroupDescription/GroupDescription';
import { useQuery } from '@apollo/client';
import { GET_GROUP } from '../../../graphql/queries/Group';

export interface GroupContactProps {
  match: any;
}

export const GroupContact: React.FC<GroupContactProps> = (props: GroupContactProps) => {
  const groupId = props.match.params.id;
  const group = useQuery(GET_GROUP, { variables: { id: groupId } });
  const title = group.data ? group.data.group.group.label : 'Group';
  let users, description;

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
