import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { GET_COLLECTION } from 'graphql/queries/Collection';
import styles from './CollectionContact.module.css';
import { CollectionContactList } from './CollectionContactList/CollectionContactList';
import { CollectionDescription } from './CollectionDescription/CollectionDescription';

export const CollectionContact = () => {
  const { t } = useTranslation();

  const params = useParams();

  const collectionId = params.id;
  const collection = useQuery(GET_COLLECTION, {
    variables: { id: collectionId },
    fetchPolicy: 'cache-and-network',
  });

  const title = collection.data ? collection.data.group.group.label : t('Collection');

  let users;

  if (collection.data) {
    users = collection.data.group.group.users;
  }

  const descriptionBox = (
    <div className={styles.ContactList}>
      <CollectionDescription users={users} collectionId={collectionId} />
    </div>
  );

  return <CollectionContactList title={title} descriptionBox={descriptionBox} />;
};

export default CollectionContact;
