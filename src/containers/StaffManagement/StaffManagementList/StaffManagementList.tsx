import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './StaffManagementList.module.css';
import { USER_COUNT, FILTER_USERS } from '../../../graphql/queries/User';
import { DELETE_USER } from '../../../graphql/mutations/User';
import { ReactComponent as StaffIcon } from '../../../assets/images/icons/Collection/Dark.svg';
import { ReactComponent as ChatIcon } from '../../../assets/images/icons/Chat/UnselectedDark.svg';
import { List } from '../../List/List';
import { getUserRole } from '../../../context/role';

export interface StaffManagementProps {}

export const StaffManagementList: React.SFC<StaffManagementProps> = () => {
  const { t } = useTranslation();

  const dialogMessage = t('Once deleted this action cannot be undone.');
  const chatIcon = <ChatIcon />;
  const additionalAction = [
    { icon: chatIcon, parameter: 'contact.id', link: '/chat', label: t('Send Message') },
  ];
  const columnNames = ['NAME', 'PHONE NO', 'ASSIGNED TO', 'ACTIONS'];
  const columnStyles = [styles.Name, styles.Phone, styles.Collection, styles.Actions];
  const staffIcon = <StaffIcon className={styles.StaffIcon} />;

  const queries = {
    countQuery: USER_COUNT,
    filterItemsQuery: FILTER_USERS,
    deleteItemQuery: DELETE_USER,
  };

  const getName = (text: string, roleList: any) => {
    const roles = roleList.map((role: any) => role);

    return (
      <p className={`${styles.TableText} ${styles.NameText}`}>
        {text}
        <br />
        <div className={styles.Role}>{roles.join(', ')}</div>
      </p>
    );
  };

  const getPhone = (text: string) => <p className={styles.TableText}>{text}</p>;

  const getCollections = (collectionList: any) => {
    const collections = collectionList.map((collection: any) => collection.label);
    return <p className={styles.TableText}>{collections.join(', ')}</p>;
  };

  const getColumns = ({ name, phone, groups, roles }: any) => ({
    name: getName(name, roles),
    phone: getPhone(phone),
    group: getCollections(groups),
  });

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const getRestrictedAction = (param: any) => {
    const action: any = { chat: true, edit: true, delete: true };
    // we should disable edit actions for managers only in case of users with Admin role
    if (getUserRole().includes('Manager') && param.roles.includes('Admin')) {
      action.edit = false;
      action.delete = false;
    }
    return action;
  };

  return (
    <div>
      <List
        title={t('Staff Management')}
        listItem="users"
        listItemName="user"
        pageLink="staff-management"
        listIcon={staffIcon}
        dialogMessage={dialogMessage}
        {...queries}
        {...columnAttributes}
        button={{ show: true, label: t('Collections'), link: '/collection' }}
        searchParameter="name"
        additionalAction={additionalAction}
        restrictedAction={getRestrictedAction}
      />
    </div>
  );
};

export default StaffManagementList;
