import { useLazyQuery } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import styles from './CollectionInformation.module.css';
import { GET_COLLECTION_INFO, GET_COLLECTION_USERS } from '../../../graphql/queries/Collection';

export interface CollectionInformationProps {
  collectionId: any;
  staff?: boolean;
}

const displayObj: any = { 'Non template message': 0, Template: 0, 'No messages': 0 };

export const CollectionInformation: React.SFC<CollectionInformationProps> = ({
  collectionId,
  staff = true,
}) => {
  const [display, setDisplay] = useState(displayObj);
  const [getCollectionInfo, { data: collectionInfo }] = useLazyQuery(GET_COLLECTION_INFO);

  const [selectedUsers, { data: collectionUsers }] = useLazyQuery(GET_COLLECTION_USERS, {
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (collectionId) {
      getCollectionInfo({ variables: { id: collectionId } });
      selectedUsers({ variables: { id: collectionId } });
      // reset to zero on collection change
      setDisplay({ 'Non template message': 0, Template: 0, 'No messages': 0 });
    }
  }, [collectionId]);

  useEffect(() => {
    if (collectionInfo) {
      const info = JSON.parse(collectionInfo.groupInfo);
      const displayCopy = { ...displayObj };
      Object.keys(info).forEach((key) => {
        if (key === 'session' || key === 'session_and_hsm') {
          displayCopy['Non template message'] += info[key];
        } else if (key === 'session_and_hsm' || key === 'hsm') {
          displayCopy.Template += info[key];
        } else if (key === 'none') {
          displayCopy['No messages'] = info[key];
        }
      });
      setDisplay(displayCopy);
    }
  }, [collectionInfo]);

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
    <div className={styles.InfoWrapper}>
      <div className={styles.CollectionInformation} data-testid="CollectionInformation">
        <div>Contacts qualified for-</div>
        {Object.keys(display).map((data: any) => (
          <div key={data} className={styles.SessionInfo}>
            {data}: <span className={styles.SessionCount}> {display[data]}</span>
          </div>
        ))}
      </div>
      <div className={styles.CollectionAssigned}>
        {assignedToCollection && staff ? (
          <>
            <span className={styles.CollectionHeading}>Assigned to</span>
            <span className={styles.CollectionsName}>{assignedToCollection}</span>
          </>
        ) : null}
      </div>
    </div>
  );
};
