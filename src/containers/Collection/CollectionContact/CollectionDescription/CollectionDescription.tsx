import React from 'react';
import { CollectionInformation } from '../../CollectionInformation/CollectionInformation';
import styles from './CollectionDescription.module.css';

export interface CollectionDescriptionProps {
  users: Array<any>;
  description: string;
  collectionId?: string;
}

export const CollectionDescription: React.FC<CollectionDescriptionProps> = ({
  users = [],
  description,
  collectionId,
}: CollectionDescriptionProps) => {
  const userList = (
    <ul className={styles.UserList}>
      {users.map((user: any) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
  return (
    <div className={styles.DescriptionContainer} data-testid="collectionDescription">
      <h2 className={styles.Title}>Description</h2>
      <p className={styles.Description}>{description}</p>
      <div className={styles.CollectionInformation}>
        <CollectionInformation collectionId={collectionId} staff={false} />
      </div>

      <div className={styles.StaffDivider} />
      <h2 className={styles.Title}>Assigned to staff</h2>
      <div>{userList}</div>
    </div>
  );
};
