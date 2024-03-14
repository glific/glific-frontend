import { useParams } from 'react-router-dom';
import { List } from 'containers/List/List';
import { useTranslation } from 'react-i18next';
import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';
import styles from './GroupDetails.module.css';
import { UPDATE_GROUP_CONTACT } from 'graphql/mutations/Group';
import { CONTACT_SEARCH_QUERY, GET_CONTACT_COUNT } from 'graphql/queries/Contact';

export const GroupDetails = () => {
  const params = useParams();
  const { t } = useTranslation();

  const dialogTitle = 'Are you sure you want to remove this contact from the group?';
  const dialogMessage = 'The contact will no longer receive messages sent to this group';

  const columnNames = [
    { name: 'name', label: t('Name') },
    { label: t('Phone number') },
    { label: t('Actions') },
  ];

  const queries = {
    countQuery: GET_CONTACT_COUNT,
    filterItemsQuery: CONTACT_SEARCH_QUERY,
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

  const getColumns = (contact: any) => {
    return {
      name: getName(contact?.name),
      phone: getPhoneNumber(contact?.phone),
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
      listItem="contacts"
      listItemName="contacts"
      searchParameter={['term']}
      filters={{ includeWaGroups: params.id }}
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
