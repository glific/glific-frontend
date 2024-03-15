import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { setNotification } from 'common/notification';
import { setVariables } from 'common/constants';
import { CONTACT_SEARCH_QUERY, GET_COLLECTION_CONTACTS } from 'graphql/queries/Contact';
import {
  UPDATE_COLLECTION_CONTACTS,
  UPDATE_COLLECTION_WA_GROUP,
} from 'graphql/mutations/Collection';
import { SearchDialogBox } from 'components/UI/SearchDialogBox/SearchDialogBox';
import { GET_WA_GROUPS } from 'graphql/queries/WA_Groups';

interface AddToCollectionProps {
  collectionId: string | undefined;
  setDialog: Function;
  groups?: boolean;
}

export const AddToCollection = ({ collectionId, setDialog, groups }: AddToCollectionProps) => {
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const { t } = useTranslation();

  let searchquery = groups ? GET_WA_GROUPS : CONTACT_SEARCH_QUERY;
  let updateMutation = groups ? UPDATE_COLLECTION_WA_GROUP : UPDATE_COLLECTION_CONTACTS;
  let entity = groups ? 'waGroups' : 'contacts';

  const { data: entityData } = useQuery(searchquery, {
    variables: groups ? setVariables({}, 50) : setVariables({ name: contactSearchTerm }, 50),
  });

  const { data: collectionContactsData } = useQuery(GET_COLLECTION_CONTACTS, {
    variables: { id: collectionId },
  });

  const [updateCollection] = useMutation(updateMutation, {
    onCompleted: (data) => {
      let updateVariable = groups ? 'updateCollectionWaGroup' : 'updateGroupContacts';
      const { numberDeleted, groupContacts } = data[updateVariable];

      const numberAdded = groupContacts.length;
      if (numberDeleted > 0 && numberAdded > 0) {
        setNotification(
          `${numberDeleted} ${groups ? 'group' : 'contact'}${
            numberDeleted === 1 ? '' : 's  were'
          } removed and ${numberAdded} contact${numberAdded === 1 ? '' : 's  were'} added`
        );
      } else if (numberDeleted > 0) {
        setNotification(
          `${numberDeleted} ${groups ? 'group' : 'contact'}${numberDeleted === 1 ? '' : 's  were'} removed`
        );
      } else {
        setNotification(
          `${numberAdded} ${groups ? 'group' : 'contact'}${numberAdded === 1 ? '' : 's  were'} added`
        );
      }
      setDialog(false);
    },
    refetchQueries: [{ query: GET_COLLECTION_CONTACTS, variables: { id: collectionId } }],
  });
  let entityOptions = [];
  let collectionEntities: Array<any> = [];

  if (entityData) {
    entityOptions = entityData[entity];
  }
  if (collectionContactsData) {
    collectionEntities = collectionContactsData.group.group[entity];
  }

  const handleCollectionAdd = (value: any) => {
    const selectedContacts = value.filter(
      (contact: any) =>
        !collectionEntities.map((collectionContact: any) => collectionContact.id).includes(contact)
    );
    const unselectedContacts = collectionEntities
      .map((collectionContact: any) => collectionContact.id)
      .filter((contact: any) => !value.includes(contact));

    if (selectedContacts.length === 0 && unselectedContacts.length === 0) {
      setDialog(false);
    } else {
      const addvariable = groups ? 'addWaGroupIds' : 'addContactIds';
      const deletevariable = groups ? 'deleteWaGroupIds' : 'deleteContactIds';
      updateCollection({
        variables: {
          input: {
            [addvariable]: selectedContacts,
            groupId: collectionId,
            [deletevariable]: unselectedContacts,
          },
        },
      });
    }
  };

  let searchDialogTitle = groups
    ? t('Add groups to the collection')
    : t('Add contacts to the collection');

  return (
    <SearchDialogBox
      title={searchDialogTitle}
      handleOk={handleCollectionAdd}
      handleCancel={() => setDialog(false)}
      options={entityOptions}
      optionLabel="name"
      additionalOptionLabel="phone"
      asyncSearch
      disableClearable
      selectedOptions={collectionEntities}
      onChange={(value: any) => {
        if (typeof value === 'string') {
          setContactSearchTerm(value);
        }
      }}
    />
  );
};

export default AddToCollection;
