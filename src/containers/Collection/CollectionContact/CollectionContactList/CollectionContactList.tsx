import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { CONTACT_SEARCH_QUERY, GET_CONTACT_COUNT } from 'graphql/queries/Contact';
import { UPDATE_COLLECTION_CONTACTS } from 'graphql/mutations/Collection';
import { ReactComponent as CollectionIcon } from 'assets/images/icons/Collection/Dark.svg';
import { List } from 'containers/List/List';
import styles from './CollectionContactList.module.css';

export interface CollectionContactListProps {
  title: string;
}

const getName = (label: string, phone: string) => (
  <>
    <p className={styles.NameText}>{label}</p>
    <p className={styles.Phone}>{phone}</p>
  </>
);

const getCollections = (collections: Array<any>) => (
  <p className={styles.CollectionsText}>
    {collections.map((collection: any) => collection.label).join(', ')}
  </p>
);

const getColumns = ({ name, maskedPhone, groups }: any) => ({
  label: getName(name, maskedPhone),
  groups: getCollections(groups),
});

const columnStyles = [styles.Name, styles.Phone, styles.Actions];
const collectionIcon = <CollectionIcon className={styles.CollectionIcon} />;

const queries = {
  countQuery: GET_CONTACT_COUNT,
  filterItemsQuery: CONTACT_SEARCH_QUERY,
  deleteItemQuery: UPDATE_COLLECTION_CONTACTS,
};

const columnAttributes = {
  columns: getColumns,
  columnStyles,
};

export const CollectionContactList = ({ title }: CollectionContactListProps) => {
  const { t } = useTranslation();
  const params = useParams();

  const collectionId = params.id;

  const getDeleteQueryVariables = (id: any) => ({
    input: {
      groupId: collectionId,
      addContactIds: [],
      deleteContactIds: [id],
    },
  });

  const columnNames = [
    { name: 'name', label: t('Beneficiary') },
    { label: t('All Collections') },
    { label: t('Actions') },
  ];

  const dialogTitle = t('Are you sure you want to remove contact from this collection?');
  const dialogMessage = t('The contact will no longer receive messages sent to this collection');

  return (
    <List
      backLinkButton={{ text: t('Back to all collections'), link: '/collection' }}
      dialogTitle={dialogTitle}
      columnNames={columnNames}
      title={title}
      listItem="contacts"
      listItemName="contact"
      searchParameter={['name']}
      filters={{ includeGroups: collectionId }}
      button={{ show: false, label: '' }}
      pageLink="contact"
      listIcon={collectionIcon}
      deleteModifier={{
        icon: 'cross',
        variables: getDeleteQueryVariables,
        label: t('Remove from this collection'),
      }}
      editSupport={false}
      dialogMessage={dialogMessage}
      {...queries}
      {...columnAttributes}
    />
  );
};
