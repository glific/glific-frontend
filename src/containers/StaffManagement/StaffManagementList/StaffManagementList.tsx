import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client';
import { GET_ORGANIZATION_PHONE } from 'graphql/queries/Organization';
import { USER_COUNT, FILTER_USERS } from 'graphql/queries/User';
import { DELETE_USER } from 'graphql/mutations/User';
import StaffIcon from 'assets/images/icons/Collection/Dark.svg?react';
import ChatIcon from 'assets/images/icons/Chat/UnselectedDark.svg?react';
import { List } from 'containers/List/List';
import { getUserRole } from 'context/role';
import styles from './StaffManagementList.module.css';
import { staffManagementInfo } from 'common/HelpData';

export const StaffManagementList = () => {
  const { t } = useTranslation();

  const { data: organizationPhone } = useQuery(GET_ORGANIZATION_PHONE);

  const dialogMessage = t('Once deleted this action cannot be undone.');
  const chatIcon = <ChatIcon />;
  const additionalAction = () => [
    { icon: chatIcon, parameter: 'contact.id', link: '/chat', label: t('Send Message') },
  ];

  const columnNames = [
    { name: 'name', label: t('Name') },
    { name: 'phone', label: t('Phone number') },
    { label: t('Assigned to') },
    { label: t('Actions') },
  ];

  const columnStyles = [styles.Name, styles.Phone, styles.Collection, styles.Actions];
  const staffIcon = <StaffIcon className={styles.StaffIcon} />;

  const queries = {
    countQuery: USER_COUNT,
    filterItemsQuery: FILTER_USERS,
    deleteItemQuery: DELETE_USER,
  };

  const getName = (text: string, roleList: any) => {
    const roles = roleList.map((role: any) => role.label);

    return (
      <div className={`${styles.TableText} ${styles.NameText}`}>
        {text}
        <br />
        <div className={styles.Role}>{roles.join(', ')}</div>
      </div>
    );
  };

  const getPhone = (text: string) => <p className={styles.TableText}>{text}</p>;

  const getCollections = (collectionList: any) => {
    const collections = collectionList.map((collection: any) => collection.label);
    return <p className={styles.TableText}>{collections.join(', ')}</p>;
  };

  const getColumns = ({ name, phone, groups, accessRoles }: any) => ({
    name: getName(name, accessRoles),
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

    // we should not allow any actions to the organization number
    if (param.phone === organizationPhone?.organization?.organization?.contact?.phone) {
      action.edit = false;
      action.delete = false;
      action.restricted = true;
    }

    const userRoles = param.accessRoles.map((role: any) => role.label);

    // we should disable edit actions for admin and managers in case of users with Glific admin role
    if (
      (getUserRole().includes('Admin') || getUserRole().includes('Manager')) &&
      userRoles.includes('Glific_admin')
    ) {
      action.edit = false;
      action.delete = false;
    }

    // we should disable edit actions for managers only in case of users with Admin role
    if (getUserRole().includes('Manager') && userRoles.includes('Admin')) {
      action.edit = false;
      action.delete = false;
    }

    return action;
  };

  return (
    <div>
      <List
        helpData={staffManagementInfo}
        title={t('Staff Management')}
        listItem="users"
        listItemName="user"
        pageLink="staff-management"
        listIcon={staffIcon}
        dialogMessage={dialogMessage}
        {...queries}
        {...columnAttributes}
        button={{ show: true, label: t('Collections'), link: '/collection' }}
        searchParameter={['name']}
        additionalAction={additionalAction}
        restrictedAction={getRestrictedAction}
      />
    </div>
  );
};

export default StaffManagementList;
