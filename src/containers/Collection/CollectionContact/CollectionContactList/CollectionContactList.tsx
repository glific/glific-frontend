import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import {
  CONTACT_SEARCH_QUERY,
  GET_CONTACTS_LIST,
  GET_CONTACT_COUNT,
} from 'graphql/queries/Contact';
import { UPDATE_COLLECTION_CONTACTS } from 'graphql/mutations/Collection';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';
import { List } from 'containers/List/List';
import styles from './CollectionContactList.module.css';
import { useLazyQuery, useMutation } from '@apollo/client';
import { setVariables } from 'common/constants';
import { SearchDialogBox } from 'components/UI/SearchDialogBox/SearchDialogBox';
import { Button } from 'components/UI/Form/Button/Button';
import { getContactStatus } from 'common/utils';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { setNotification } from 'common/notification';

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
  const [removeContactsDialogShow, setRemoveContactsDialogShow] = useState(false);
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [selectedContacts, setSelectedContact] = useState<any>([]);
  const [contactsToRemove, setContactsToRemove] = useState<any>([]);
  const [contactOptions, setContactOptions] = useState<any>([]);

  const { t } = useTranslation();
  const params = useParams();

  const collectionId = params.id;
  let dialog;

  const [getContacts, { data: contactsData }] = useLazyQuery(GET_CONTACTS_LIST, {
    fetchPolicy: 'cache-and-network',
  });

  const [updateCollectionContacts] = useMutation(UPDATE_COLLECTION_CONTACTS);

  const handleCollectionAdd = (selectedContacts: any) => {
    if (selectedContacts.length === 0) {
      setAddContactsDialogShow(false);
    } else {
      updateCollectionContacts({
        variables: {
          input: {
            addContactIds: selectedContacts,
            groupId: collectionId,
            deleteContactIds: [],
          },
        },
        onCompleted: () => {
          setNotification('Contact added successfully', 'success');
        },
      });
    }
    setAddContactsDialogShow(false);
  };

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
        setNotification('Contact deleted successfully', 'success');
      },
    });
    setRemoveContactsDialogShow(false);
    setContactsToRemove([]);
  };

  const setDialogBox = (selectedContacts: any) => {
    setRemoveContactsDialogShow(true);
    setSelectedContact(selectedContacts);
  };

  useEffect(() => {
    if (contactsData) {
      setContactOptions(contactsData.contacts);
    }
  }, [contactsData]);

  if (addContactsDialogShow) {
    dialog = (
      <SearchDialogBox
        title={t('Add contacts to collection')}
        handleOk={handleCollectionAdd}
        handleCancel={() => setAddContactsDialogShow(false)}
        options={contactOptions}
        optionLabel="name"
        additionalOptionLabel="phone"
        asyncSearch
        colorOk="primary"
        buttonOk="Add"
        disableClearable
        searchLabel="Search contacts"
        textFieldPlaceholder="Type here"
        onChange={(value: any) => {
          if (typeof value === 'string') {
            setContactSearchTerm(value);
          }
        }}
        selectedOptions={[]}
        fullWidth={true}
        showTags={false}
        placeholder="Select contacts"
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
        getContacts({
          variables: setVariables({ name: contactSearchTerm, excludeGroups: collectionId }, 50),
        });
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
      />
    </>
  );
};
