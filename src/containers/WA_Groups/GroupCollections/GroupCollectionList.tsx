import { COUNT_WA_GROUP_CONTACTS, LIST_WA_GROUP_CONTACTS } from 'graphql/queries/WA_Groups';
import { useParams } from 'react-router-dom';
import { List } from 'containers/List/List';
import { useTranslation } from 'react-i18next';
import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';
import styles from './GroupCollectionList.module.css';
import { UPDATE_GROUP_CONTACT } from 'graphql/mutations/Group';
import { GET_WA_GROUP_COLLECTIONS_COUNT, GROUP_GET_COLLECTION } from 'graphql/queries/Collection';

export const GroupCollectionList = () => {
  const params = useParams();
  const { t } = useTranslation();

  const dialogTitle = 'Are you sure you want to remove this contact from the group?';
  const dialogMessage = 'The contact will no longer receive messages sent to this group';

  const columnNames = [
    { name: 'id', label: t('Name') },
    { name: 'label', label: t('Title') },
    { label: t('Description') },
    { label: t('Contacts') },
    { label: t('Actions') },
  ];

  const queries = {
    countQuery: GET_WA_GROUP_COLLECTIONS_COUNT,
    filterItemsQuery: GROUP_GET_COLLECTION,
    deleteItemQuery: UPDATE_GROUP_CONTACT,
  };

  const getName = (label: string) => (
    <div>
      <div className={styles.NameText}>{label}</div>
    </div>
  );

  const getPhoneNumber = (phone: string) => (
    <div>
      <div className={styles.Phone}>{phone}</div>
    </div>
  );

  const getColumns = (waContact: any) => {
    return {
      name: getName(waContact?.contact?.name),
      phone: getPhoneNumber(waContact?.contact?.phone),
    };
  };

  const collectionIcon = <CollectionIcon className={styles.CollectionIcon} />;
  const columnStyles = [styles.Name, styles.Phone, styles.Actions];

  const columnAttributes = {
    columns: getColumns,
    columnStyles,
  };

  const getDeleteQueryVariables = (id: any) => ({
    input: {
      addWaContactIds: [],
      deleteWaContactIds: [id],
      waGroupId: params.id,
    },
  });

  return (
    <List
      dialogTitle={dialogTitle}
      columnNames={columnNames}
      title={'Group Details'}
      listItem="ContactWaGroup"
      listItemName="ContactWaGroup"
      searchParameter={['term']}
      filters={{ waGroupId: params.id }}
      button={{ show: false, label: '' }}
      pageLink="waGroupsContact"
      listIcon={collectionIcon}
      editSupport={false}
      showActions={true}
      dialogMessage={dialogMessage}
      deleteModifier={{
        variables: getDeleteQueryVariables,
      }}
      {...queries}
      {...columnAttributes}
    />
  );
};

export default GroupCollectionList;
