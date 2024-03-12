import { COUNT_WA_GROUP_CONTACTS, LIST_WA_GROUP_CONTACTS } from 'graphql/queries/WA_Groups';
import { useParams } from 'react-router-dom';
import { List } from 'containers/List/List';
import { useTranslation } from 'react-i18next';
import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';
import styles from './GroupDetails.module.css';
import { UPDATE_GROUP_CONTACT } from 'graphql/mutations/Group';

export const GroupDetails = () => {
  const params = useParams();
  const { t } = useTranslation();

  const dialogTitle = 'Are you sure you want to remove this contact from the group?';
  const dialogMessage = 'The contact will no longer receive messages sent to this group';

  const columnNames = [
    { name: 'id', label: t('Name') },
    { label: t('Phone number') },
    { label: t('Actions') },
  ];

  const queries = {
    countQuery: COUNT_WA_GROUP_CONTACTS,
    filterItemsQuery: LIST_WA_GROUP_CONTACTS,
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

export default GroupDetails;
