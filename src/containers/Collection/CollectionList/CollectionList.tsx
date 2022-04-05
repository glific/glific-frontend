import React, { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { ReactComponent as CollectionIcon } from 'assets/images/icons/Collection/Dark.svg';
import { ReactComponent as AddContactIcon } from 'assets/images/icons/Contact/Add.svg';
import { DELETE_COLLECTION, UPDATE_COLLECTION_CONTACTS } from 'graphql/mutations/Collection';
import { GET_COLLECTIONS_COUNT, FILTER_COLLECTIONS } from 'graphql/queries/Collection';
import { CONTACT_SEARCH_QUERY, GET_COLLECTION_CONTACTS } from 'graphql/queries/Contact';
import { List } from 'containers/List/List';
import { SearchDialogBox } from 'components/UI/SearchDialogBox/SearchDialogBox';
import { getUserRolePermissions, getUserRole } from 'context/role';
import { setNotification } from 'common/notification';
import { setVariables } from 'common/constants';
import styles from './CollectionList.module.css';

export interface CollectionListProps {}

const getLabel = (label: string, usersCount: number) => (
  <div>
    <div className={styles.LabelText}>{label}</div>
    <div className={styles.UserCount}>
      {usersCount} contact{usersCount === 1 ? '' : 's'}
    </div>
  </div>
);

const getDescription = (text: string) => <p className={styles.CollectionDescription}>{text}</p>;

const getColumns = ({ id, label, description, usersCount }: any) => ({
  id,
  label: getLabel(label, usersCount),
  description: getDescription(description),
});

const columnStyles = [styles.Label, styles.Description, styles.Actions];
const collectionIcon = <CollectionIcon className={styles.CollectionIcon} />;

const queries = {
  countQuery: GET_COLLECTIONS_COUNT,
  filterItemsQuery: FILTER_COLLECTIONS,
  deleteItemQuery: DELETE_COLLECTION,
};

const columnAttributes = {
  columns: getColumns,
  columnStyles,
};

export const CollectionList: React.SFC<CollectionListProps> = () => {
  const [addContactsDialogShow, setAddContactsDialogShow] = useState(false);

  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [collectionId, setCollectionId] = useState();

  const { t } = useTranslation();

  const [getContacts, { data: contactsData }] = useLazyQuery(CONTACT_SEARCH_QUERY, {
    variables: setVariables({ name: contactSearchTerm }, 50),
  });

  const [getCollectionContacts, { data: collectionContactsData }] =
    useLazyQuery(GET_COLLECTION_CONTACTS);

  const [updateCollectionContacts] = useMutation(UPDATE_COLLECTION_CONTACTS, {
    onCompleted: (data) => {
      const { numberDeleted, groupContacts } = data.updateGroupContacts;
      const numberAdded = groupContacts.length;
      if (numberDeleted > 0 && numberAdded > 0) {
        setNotification(
          `${numberDeleted} contact${
            numberDeleted === 1 ? '' : 's  were'
          } removed and ${numberAdded} contact${numberAdded === 1 ? '' : 's  were'} added`
        );
      } else if (numberDeleted > 0) {
        setNotification(`${numberDeleted} contact${numberDeleted === 1 ? '' : 's  were'} removed`);
      } else {
        setNotification(`${numberAdded} contact${numberAdded === 1 ? '' : 's  were'} added`);
      }
      setAddContactsDialogShow(false);
    },
    refetchQueries: [{ query: GET_COLLECTION_CONTACTS, variables: { id: collectionId } }],
  });

  const dialogMessage = t("You won't be able to use this collection again.");

  let contactOptions: any = [];
  let collectionContacts: Array<any> = [];

  if (contactsData) {
    contactOptions = contactsData.contacts;
  }
  if (collectionContactsData) {
    collectionContacts = collectionContactsData.group.group.contacts;
  }

  let dialog = null;

  const setContactsDialog = (id: any) => {
    getCollectionContacts({ variables: { id } });
    getContacts();
    setCollectionId(id);
    setAddContactsDialogShow(true);
  };

  const handleCollectionAdd = (value: any) => {
    const selectedContacts = value.filter(
      (contact: any) =>
        !collectionContacts.map((collectionContact: any) => collectionContact.id).includes(contact)
    );
    const unselectedContacts = collectionContacts
      .map((collectionContact: any) => collectionContact.id)
      .filter((contact: any) => !value.includes(contact));

    if (selectedContacts.length === 0 && unselectedContacts.length === 0) {
      setAddContactsDialogShow(false);
    } else {
      updateCollectionContacts({
        variables: {
          input: {
            addContactIds: selectedContacts,
            groupId: collectionId,
            deleteContactIds: unselectedContacts,
          },
        },
      });
    }
  };

  if (addContactsDialogShow) {
    dialog = (
      <SearchDialogBox
        title={t('Add contacts to the collection')}
        handleOk={handleCollectionAdd}
        handleCancel={() => setAddContactsDialogShow(false)}
        options={contactOptions}
        optionLabel="name"
        additionalOptionLabel="phone"
        asyncSearch
        disableClearable
        selectedOptions={collectionContacts}
        renderTags={false}
        searchLabel="Search contacts"
        textFieldPlaceholder="Type here"
        onChange={(value: any) => {
          if (typeof value === 'string') {
            setContactSearchTerm(value);
          }
        }}
      />
    );
  }

  const addContactIcon = <AddContactIcon />;

  const additionalAction = [
    {
      label: t('Add contacts to collection'),
      icon: addContactIcon,
      parameter: 'id',
      dialog: setContactsDialog,
    },
  ];

  const getRestrictedAction = () => {
    const action: any = { edit: true, delete: true };
    if (getUserRole().includes('Staff')) {
      action.edit = false;
      action.delete = false;
    }
    return action;
  };

  const cardLink = { start: 'collection', end: 'contacts' };

  // check if the user has access to manage collections
  const userRolePermissions = getUserRolePermissions();
  return (
    <>
      <List
        restrictedAction={getRestrictedAction}
        title={t('Collections')}
        listItem="groups"
        columnNames={['TITLE']}
        listItemName="collection"
        displayListType="card"
        button={{ show: userRolePermissions.manageCollections, label: t('+ Create Collection') }}
        pageLink="collection"
        listIcon={collectionIcon}
        dialogMessage={dialogMessage}
        additionalAction={additionalAction}
        cardLink={cardLink}
        {...queries}
        {...columnAttributes}
      />
      {dialog}
    </>
  );
};

export default CollectionList;
