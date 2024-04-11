import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { CONTACT_SEARCH_QUERY, GET_CONTACT_COUNT } from 'graphql/queries/Contact';
import { UPDATE_COLLECTION_CONTACTS } from 'graphql/mutations/Collection';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';
import { List } from 'containers/List/List';
import styles from './CollectionContactList.module.css';
import { useLazyQuery, useMutation } from '@apollo/client';
import { setVariables } from 'common/constants';
import { SearchDialogBox } from 'components/UI/SearchDialogBox/SearchDialogBox';
import { Button } from 'components/UI/Form/Button/Button';
import { getContactStatus } from 'common/utils';

export interface CollectionContactListProps {
  title: string;
  descriptionBox?: any;
}

const getName = (label: string, phone: string) => (
  <div>
    <div className={styles.NameText}>{label}</div>
    <div className={styles.Phone}>{phone}</div>
  </div>
);

const getCollections = (collections: Array<any>) => (
  <div className={styles.CollectionsText}>
    {collections.map((collection: any) => collection.label).join(', ')}
  </div>
);

const getColumns = (contact: any) => {
  const { name, maskedPhone, groups } = contact;
  return {
    label: getName(name, maskedPhone),
    status: getContactStatus(contact),
    groups: getCollections(groups),
  };
};

const columnStyles = [styles.Name, styles.Phone, styles.Status, styles.Actions];
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

export const CollectionContactList = ({
  title,
  descriptionBox = <></>,
}: CollectionContactListProps) => {
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

  const handleCollectionRemove = () => {
    const idsToRemove = selectedContacts.map((collection: any) => collection.id);
    deleleCollectionContacts({
      variables: {
        input: {
          groupId: collectionId,
          addContactIds: [],
          deleteContactIds: idsToRemove,
        },
      },
    });
    setAddContactsDialogShow(false);
    setSelectedContact([]);
  };

  if (addContactsDialogShow) {
    let contactOptions: any = [];
    if (contactsData) {
      contactOptions = contactsData.contacts;
    }

    dialog = (
      <SearchDialogBox
        title={t('Remove contacts from collection')}
        handleOk={handleCollectionRemove}
        handleCancel={() => setAddContactsDialogShow(false)}
        options={[...contactOptions]}
        optionLabel="name"
        additionalOptionLabel="phone"
        asyncSearch
        colorOk="warning"
        buttonOk="Remove"
        disableClearable={false}
        selectedOptions={selectedContacts}
        searchLabel="Search contacts"
        textFieldPlaceholder="Type here"
        onChange={(value: any) => {
          if (typeof value === 'string') {
            setContactSearchTerm(value);
          } else if (typeof value === 'object') {
            setSelectedContact(value);
          }
        }}
      />
    );
  }

  const columnNames = [
    { name: 'name', label: t('Beneficiary') },
    { label: 'Status' },
    { label: t('All Collections') },
    { label: t('Actions') },
  ];

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
      data-testid="removeBtn"
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
      {dialog}
      <List
        descriptionBox={descriptionBox}
        dialogTitle={dialogTitle}
        columnNames={columnNames}
        title={title}
        additionalAction={additionalAction}
        secondaryButton={removeCollectionButton}
        listItem="contacts"
        listItemName="contact"
        searchParameter={['term']}
        filters={{ includeGroups: collectionId }}
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
