import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { CONTACT_SEARCH_QUERY, GET_CONTACT_COUNT, GET_GROUP_COUNT } from 'graphql/queries/Contact';
import { UPDATE_COLLECTION_CONTACTS, UPDATE_COLLECTION_GROUPS } from 'graphql/mutations/Collection';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';
import { List } from 'containers/List/List';
import styles from './GroupCollectionList.module.css';
import { useLazyQuery, useMutation } from '@apollo/client';
import { setVariables } from 'common/constants';
import { SearchDialogBox } from 'components/UI/SearchDialogBox/SearchDialogBox';
import { Button } from 'components/UI/Form/Button/Button';
import { GROUP_GET_COLLECTION } from 'graphql/queries/Collection';

export interface CollectionGroupListProps {
  title: string;
  descriptionBox?: any;
}

const getName = (label: string) => (
  <div>
    <div className={styles.NameText}>{label}</div>
  </div>
);

const getColumns = (fields: any) => {
  const { label } = fields;
  console.log(fields);

  return {
    label: getName(label),
  };
};

const columnStyles = [styles.Name, styles.Phone, styles.Actions];
const collectionIcon = <CollectionIcon className={styles.CollectionIcon} />;

const queries = {
  countQuery: GET_GROUP_COUNT,
  filterItemsQuery: GROUP_GET_COLLECTION,
  deleteItemQuery: UPDATE_COLLECTION_GROUPS,
};

const columnAttributes = {
  columns: getColumns,
  columnStyles,
};

export const CollectionGroupList = () => {
  const [addContactsDialogShow, setAddContactsDialogShow] = useState(false);
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [selectedContacts, setSelectedContact] = useState<any>([]);

  const { t } = useTranslation();
  const params = useParams();

  const collectionId = params.id;
  let dialog;

  const [getContacts, { data: contactsData }] = useLazyQuery(CONTACT_SEARCH_QUERY, {
    variables: setVariables({ name: contactSearchTerm, includeGroups: [collectionId] }, 50),
  });

  const [deleleCollectionContacts] = useMutation(UPDATE_COLLECTION_CONTACTS);
  const getDeleteQueryVariables = (id: any) => ({
    input: {
      groupId: collectionId,
      addContactIds: [],
      deleteContactIds: [id],
    },
  });

  const columnNames = [{ name: 'name', label: t('Beneficiary') }, { label: t('Actions') }];

  const additionalAction = () => [
    {
      icon: <ArrowForwardIcon className={styles.RedirectArrow} />,
      label: t('View profile'),
      link: '/contact-profile',
      parameter: 'id',
    },
  ];
  const removeCollectionButton = (
    <Button
      variant="contained"
      color="error"
      onClick={() => {
        getContacts();
        setAddContactsDialogShow(true);
      }}
    >
      Remove contacts
    </Button>
  );

  const dialogTitle = t('Are you sure you want to remove contact from this collection?');
  const dialogMessage = t('The contact will no longer receive messages sent to this collection');

  return (
    <>
      <List
        dialogTitle={dialogTitle}
        columnNames={columnNames}
        title={'Collection'}
        additionalAction={additionalAction}
        secondaryButton={removeCollectionButton}
        listItem="WaGroupsCollection"
        listItemName="WaGroupsCollection"
        searchParameter={['term']}
        filters={{ groupId: collectionId }}
        button={{ show: false, label: '' }}
        pageLink="contact"
        listIcon={collectionIcon}
        deleteModifier={{
          variables: getDeleteQueryVariables,
        }}
        editSupport={false}
        dialogMessage={dialogMessage}
        {...queries}
        {...columnAttributes}
      />
    </>
  );
};
