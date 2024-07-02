import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { setNotification } from 'common/notification';
import { setVariables } from 'common/constants';
import { GET_CONTACTS_LIST } from 'graphql/queries/Contact';
import {
  UPDATE_COLLECTION_CONTACTS,
  UPDATE_COLLECTION_WA_GROUP,
} from 'graphql/mutations/Collection';
import { SearchDialogBox } from 'components/UI/SearchDialogBox/SearchDialogBox';
import { GET_WA_GROUPS } from 'graphql/queries/WaGroups';

interface AddToCollectionProps {
  collectionId: string | undefined;
  setDialog: Function;
  groups?: boolean;
}

export const AddToCollection = ({ collectionId, setDialog, groups }: AddToCollectionProps) => {
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const { t } = useTranslation();

  let searchquery = groups ? GET_WA_GROUPS : GET_CONTACTS_LIST;
  let updateMutation = groups ? UPDATE_COLLECTION_WA_GROUP : UPDATE_COLLECTION_CONTACTS;
  let entity = groups ? 'waGroups' : 'contacts';

  const { data: entityData } = useQuery(searchquery, {
    variables: groups
      ? setVariables({ excludeGroups: collectionId }, 50)
      : setVariables({ name: contactSearchTerm, excludeGroups: collectionId }, 50),
    fetchPolicy: 'cache-and-network',
  });

  const [updateCollection] = useMutation(updateMutation, {
    onCompleted: (data) => {
      let updateVariable = groups ? 'updateCollectionWaGroup' : 'updateGroupContacts';
      const { groupContacts } = data[updateVariable];

      const numberAdded = groupContacts.length;

      if (numberAdded > 0) {
        setNotification(
          `${numberAdded} ${groups ? 'group' : 'contact'}${numberAdded === 1 ? '' : 's  were'} added`
        );
      }

      setDialog(false);
    },
  });
  let entityOptions = [];

  if (entityData) {
    entityOptions = entityData[entity];
  }

  const handleCollectionAdd = (selectedContacts: any) => {
    if (selectedContacts.length === 0) {
      setDialog(false);
    } else {
      const addvariable = groups ? 'addWaGroupIds' : 'addContactIds';
      const deletevariable = groups ? 'deleteWaGroupIds' : 'deleteContactIds';

      updateCollection({
        variables: {
          input: {
            [addvariable]: selectedContacts,
            groupId: collectionId,
            [deletevariable]: [],
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
      selectedOptions={[]}
      fullWidth={true}
      showTags={false}
      onChange={(value: any) => {
        if (typeof value === 'string') {
          setContactSearchTerm(value);
        }
      }}
    />
  );
};

export default AddToCollection;
