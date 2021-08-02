import React, { useState } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { setNotification } from 'common/notification';
import { setVariables } from 'common/constants';
import { CONTACT_SEARCH_QUERY, GET_COLLECTION_CONTACTS } from 'graphql/queries/Contact';
import { UPDATE_COLLECTION_CONTACTS } from 'graphql/mutations/Collection';
import { SearchDialogBox } from 'components/UI/SearchDialogBox/SearchDialogBox';

interface AddContactsToCollectionProps {
  collectionId: string | undefined;
  setDialog: Function;
}

export const AddContactsToCollection: React.SFC<AddContactsToCollectionProps> = ({
  collectionId,
  setDialog,
}) => {
  const client = useApolloClient();
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const { t } = useTranslation();

  const { data: contactsData } = useQuery(CONTACT_SEARCH_QUERY, {
    variables: setVariables({ name: contactSearchTerm }, 50),
  });

  const { data: collectionContactsData } = useQuery(GET_COLLECTION_CONTACTS, {
    variables: { id: collectionId },
  });

  const [updateCollectionContacts] = useMutation(UPDATE_COLLECTION_CONTACTS, {
    onCompleted: (data) => {
      const { numberDeleted, groupContacts } = data.updateGroupContacts;
      const numberAdded = groupContacts.length;
      if (numberDeleted > 0 && numberAdded > 0) {
        setNotification(
          client,
          `${numberDeleted} contact${
            numberDeleted === 1 ? '' : 's  were'
          } removed and ${numberAdded} contact${numberAdded === 1 ? '' : 's  were'} added`
        );
      } else if (numberDeleted > 0) {
        setNotification(
          client,
          `${numberDeleted} contact${numberDeleted === 1 ? '' : 's  were'} removed`
        );
      } else {
        setNotification(
          client,
          `${numberAdded} contact${numberAdded === 1 ? '' : 's  were'} added`
        );
      }
      setDialog(false);
    },
    refetchQueries: [{ query: GET_COLLECTION_CONTACTS, variables: { id: collectionId } }],
  });
  let contactOptions = [];
  let collectionContacts: Array<any> = [];

  if (contactsData) {
    contactOptions = contactsData.contacts;
  }
  if (collectionContactsData) {
    collectionContacts = collectionContactsData.group.group.contacts;
  }

  const handleCollectionAdd = (value: any) => {
    const selectedContacts = value.filter(
      (contact: any) =>
        !collectionContacts.map((collectionContact: any) => collectionContact.id).includes(contact)
    );
    const unselectedContacts = collectionContacts
      .map((collectionContact: any) => collectionContact.id)
      .filter((contact: any) => !value.includes(contact));

    if (selectedContacts.length === 0 && unselectedContacts.length === 0) {
      setDialog(false);
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

  return (
    <SearchDialogBox
      title={t('Add contacts to the collection')}
      handleOk={handleCollectionAdd}
      handleCancel={() => setDialog(false)}
      options={contactOptions}
      optionLabel="name"
      additionalOptionLabel="phone"
      asyncSearch
      disableClearable
      selectedOptions={collectionContacts}
      onChange={(value: any) => {
        if (typeof value === 'string') {
          setContactSearchTerm(value);
        }
      }}
    />
  );
};

export default AddContactsToCollection;
