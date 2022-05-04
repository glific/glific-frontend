import React from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { GET_COLLECTION } from 'graphql/queries/Collection';
import styles from './CollectionContact.module.css';
import { CollectionContactList } from './CollectionContactList/CollectionContactList';
import { CollectionDescription } from './CollectionDescription/CollectionDescription';

export interface CollectionContactProps {
  match: any;
}

export const CollectionContact = ({ match }: CollectionContactProps) => {
  const { t } = useTranslation();

  const collectionId = match.params.id;
  const collection = useQuery(GET_COLLECTION, {
    variables: { id: collectionId },
    fetchPolicy: 'cache-and-network',
  });

  const title = collection.data ? collection.data.group.group.label : t('Collection');

  let users;
  let description;

  if (collection.data) {
    users = collection.data.group.group.users;
    description = collection.data.group.group.description;
  }
  return (
    <div className={styles.CollectionContactContainer}>
      <div className={styles.ContactList}>
        <CollectionContactList {...props} title={title} />
      </div>
      <div className={styles.CollectionDescription}>
        <CollectionDescription
          users={users}
          description={description}
          collectionId={collectionId}
        />
      </div>
    </div>
  );
};

export default CollectionContact;
