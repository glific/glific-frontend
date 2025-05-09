import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { CONTACT_SEARCH_QUERY, GET_CONTACT_COUNT } from 'graphql/queries/Contact';
import { UPDATE_COLLECTION_CONTACTS } from 'graphql/mutations/Collection';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';
import { List } from 'containers/List/List';
import styles from './CollectionContactList.module.css';
import { useMutation } from '@apollo/client';
import { Button } from 'components/UI/Form/Button/Button';
import { getContactStatus, getDisplayName } from 'common/utils';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { setNotification } from 'common/notification';
import AddToCollection from 'containers/Chat/ChatMessages/AddToCollection/AddToCollection';

export interface CollectionContactListProps {
  title: string;
  descriptionBox?: any;
}

const getName = (contact: any, phone: string) => {
  const displayName = getDisplayName(contact);

  return (
    <div>
      <div className={styles.NameText}>{displayName}</div>
      <div className={styles.Phone}>{phone}</div>
    </div>
  );
};

const getCollections = (collections: Array<any>) => (
  <div className={styles.CollectionsText}>{collections.map((collection: any) => collection.label).join(', ')}</div>
);

const getColumns = (contact: any) => {
  const { maskedPhone, groups } = contact;
  return {
    label: getName(contact, maskedPhone),
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

export const CollectionContactList = ({ title, descriptionBox = <></> }: CollectionContactListProps) => {
  const [addContactsDialogShow, setAddContactsDialogShow] = useState(false);
  const [removeContactsDialogShow, setRemoveContactsDialogShow] = useState(false);
  const [selectedContacts, setSelectedContact] = useState<any>([]);
  const [contactsToRemove, setContactsToRemove] = useState<any>([]);
  const [updateCollection, setUpdateCollection] = useState(false);

  const { t } = useTranslation();
  const params = useParams();

  const collectionId = params.id;
  let dialog;

  const [updateCollectionContacts] = useMutation(UPDATE_COLLECTION_CONTACTS);

  const handleCollectionRemove = () => {
    const idsToRemove = selectedContacts.map((collection: any) => collection.id);
    updateCollectionContacts({
      variables: {
        input: {
          groupId: collectionId,
          addContactIds: [],
          deleteContactIds: idsToRemove,
        },
      },
      onCompleted: () => {
        setNotification(t('Contact has been removed successfully from the collection.'), 'success');
        setUpdateCollection(!updateCollection);
      },
    });
    setRemoveContactsDialogShow(false);
    setContactsToRemove([]);
  };

  const setDialogBox = (selectedContacts: any) => {
    setRemoveContactsDialogShow(true);
    setSelectedContact(selectedContacts);
  };

  if (addContactsDialogShow) {
    dialog = (
      <AddToCollection
        collectionId={collectionId}
        setDialog={setAddContactsDialogShow}
        afterAdd={() => {
          setUpdateCollection(!updateCollection);
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

  const getRestrictedAction = () => {
    const action: any = { edit: false, delete: false };
    return action;
  };

  const addContactsButton = (
    <Button
      variant="contained"
      color="primary"
      data-testid="addBtn"
      onClick={() => {
        setAddContactsDialogShow(true);
      }}
    >
      Add contacts
    </Button>
  );

  const removeDialogBox = (
    <DialogBox
      title={t('Are you sure you want to remove contact from this collection?')}
      handleCancel={() => setRemoveContactsDialogShow(false)}
      colorOk="warning"
      alignButtons="center"
      handleOk={handleCollectionRemove}
    >
      <div className={styles.DialogText}>
        <p>{t('The contact will no longer receive messages sent to this collection')}</p>
      </div>
    </DialogBox>
  );

  return (
    <>
      {dialog}
      {removeContactsDialogShow && removeDialogBox}
      <List
        descriptionBox={descriptionBox}
        columnNames={columnNames}
        title={title}
        additionalAction={additionalAction}
        secondaryButton={addContactsButton}
        listItem="contacts"
        listItemName="contact"
        searchParameter={['term']}
        filters={{ includeGroups: collectionId }}
        button={{ show: false, label: '' }}
        pageLink="contact"
        listIcon={collectionIcon}
        editSupport={false}
        restrictedAction={getRestrictedAction}
        checkbox={{
          show: true,
          action: setDialogBox,
          selectedItems: contactsToRemove,
          setSelectedItems: setContactsToRemove,
          icon: <DeleteIcon data-testid="deleteBtn" />,
        }}
        {...queries}
        {...columnAttributes}
        refreshList={updateCollection}
      />
    </>
  );
};
