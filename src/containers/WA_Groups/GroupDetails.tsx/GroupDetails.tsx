import { WA_GROUPS_CONTACT } from 'graphql/queries/WA_Groups';
import { useParams } from 'react-router-dom';
import { List } from 'containers/List/List';
import { useTranslation } from 'react-i18next';
import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';
import { GET_CONTACT_COUNT } from 'graphql/queries/Contact';
import styles from './GroupDetails.module.css';
import { UPDATE_GROUP_CONTACT } from 'graphql/mutations/Group';

export const GroupDetails = () => {
  const params = useParams();
  const { t } = useTranslation();

  const dialogTitle = 'Are you sure you want to remove contact from this group?';
  const dialogMessage = 'The contact will no longer receive messages sent to this group';

  const columnNames = [
    { name: 'name', label: t('Name') },
    { name: 'maskedPhone', label: t('Phone number') },
  ];

  const queries = {
    countQuery: GET_CONTACT_COUNT, //TODO: Change count query and the variable below
    filterItemsQuery: WA_GROUPS_CONTACT,
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

  const getColumns = (waContact: any) => ({
    name: getName(waContact?.contact?.name),
    phone: getPhoneNumber(waContact?.contact?.maskedPhone),
  });

  const collectionIcon = <CollectionIcon className={styles.CollectionIcon} />;
  const columnStyles = [styles.Name, styles.Phone];

  const columnAttributes = {
    columns: getColumns,
    columnStyles,
  };

  return (
    <List
      dialogTitle={dialogTitle}
      columnNames={columnNames}
      title={'Group Details'}
      listItem="waGroupsContact"
      listItemName="waGroupsContact"
      searchParameter={['term']}
      filters={{ includeGroups: params.id }}
      button={{ show: false, label: '' }}
      pageLink="waGroupsContact"
      listIcon={collectionIcon}
      editSupport={false}
      showActions={false}
      dialogMessage={dialogMessage}
      {...queries}
      {...columnAttributes}
    />
  );
};

export default GroupDetails;
