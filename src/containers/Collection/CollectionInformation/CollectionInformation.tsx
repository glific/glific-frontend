import { useLazyQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import styles from './CollectionInformation.module.css';
import { GET_COLLECTION_INFO, GET_COLLECTION_USERS } from '../../../graphql/queries/Collection';

export interface CollectionInformationProps {
  collectionId: any;
}

let display: any = { 'In-session': 0, 'Session expired': 0, 'Opted-out': 0 };

export const CollectionInformation: React.SFC<CollectionInformationProps> = ({ collectionId }) => {
  const [getCollectionInfo, { data: collectionInfo }] = useLazyQuery(GET_COLLECTION_INFO);

  const [selectedUsers, { data: collectionUsers }] = useLazyQuery(GET_COLLECTION_USERS, {
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (collectionId) {
      getCollectionInfo({ variables: { id: collectionId } });
      selectedUsers({ variables: { id: collectionId } });
    }
    // reset to zero on collection change
    display = { 'In-session': 0, 'Session expired': 0, 'Opted-out': 0 };
  }, [collectionId]);

  if (collectionInfo) {
    const info = JSON.parse(collectionInfo.groupInfo);

    Object.keys(info).forEach((key) => {
      if (key === 'session_and_hsm') {
        display['In-session'] = info[key];
      } else if (key === 'session') {
        display['Session expired'] = info[key];
      } else if (key === 'none') {
        display['Opted-out'] = info[key];
      }
    });
  }

  let assignedToCollection: any = [];
  if (collectionUsers) {
    assignedToCollection = collectionUsers.group.group.users.map((user: any) => user.name);

    assignedToCollection = Array.from(new Set([].concat(...assignedToCollection)));
    if (assignedToCollection.length > 2) {
      assignedToCollection = `${assignedToCollection.slice(0, 2).join(', ')} +${(
        assignedToCollection.length - 2
      ).toString()}`;
    } else {
      assignedToCollection = assignedToCollection.join(', ');
    }
  }

  return (
    <>
      <div className={styles.CollectionInformation} data-testid="CollectionInformation">
        {Object.keys(display).map((data: any) => (
          <div key={data} className={styles.SessionInfo}>
            {data}: <span className={styles.SessionCount}> {display[data]}</span>
          </div>
        ))}
      </div>
      <div className={styles.CollectionAssigned}>
        {assignedToCollection ? (
          <>
            <span className={styles.CollectionHeading}>Assigned to</span>
            <span className={styles.CollectionsName}>{assignedToCollection}</span>
          </>
        ) : null}
      </div>
    </>
  );
};
