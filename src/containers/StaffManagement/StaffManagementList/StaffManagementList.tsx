import React from 'react';
import { USER_COUNT, FILTER_USERS } from '../../../graphql/queries/User';
import { DELETE_USER } from '../../../graphql/mutations/User';
import styles from './StaffManagementList.module.css';
import { ReactComponent as StaffIcon } from '../../../assets/images/icons/Groups/Dark.svg';
import { ReactComponent as ChatIcon } from '../../../assets/images/icons/Chat/UnselectedDark.svg';
import { List } from '../../List/List';

export interface StaffManagementProps {}

export const StaffManagementList: React.SFC<StaffManagementProps> = () => {
  const columnNames = ['NAME', 'PHONE NO.', 'ASSIGNED TO', 'ACTIONS'];
  const columnStyles = [styles.Name, styles.Phone, styles.Group, styles.Actions];
  const staffIcon = <StaffIcon className={styles.StaffIcon} />;

  const getColumns = ({ name, phone, groups, roles, contact }: any) => ({
    name: getName(name, roles),
    phone: getPhone(phone),
    group: getGroups(groups),
  });

  const queries = {
    countQuery: USER_COUNT,
    filterItemsQuery: FILTER_USERS,
    deleteItemQuery: DELETE_USER,
  };

  const getName = (text: string, roleList: any) => {
    const roles = roleList.map((role: any) => {
      return role;
    });
    return (
      <p className={styles.TableText + ' ' + styles.NameText}>
        {text}
        <br />
        <div className={styles.Role}>{roles.join(', ')}</div>
      </p>
    );
  };

  const getPhone = (text: string) => {
    return <p className={styles.TableText}>{text}</p>;
  };

  const getGroups = (groupList: any) => {
    const groups = groupList.map((group: any) => {
      return group.label;
    });
    return <p className={styles.TableText}>{groups.join(', ')}</p>;
  };

  const dialogMessage = ' Once deleted this action cannot be undone.';

  const columnAttributes = {
    columnNames: columnNames,
    columns: getColumns,
    columnStyles: columnStyles,
  };

  const chatIcon = <ChatIcon></ChatIcon>;
  const additionalAction = { icon: chatIcon, parameter: 'contact.id', link: '/chat' };

  return (
    <div>
      <List
        title="Staff Management"
        listItem="users"
        listItemName="user"
        pageLink="staff-management"
        listIcon={staffIcon}
        dialogMessage={dialogMessage}
        {...queries}
        {...columnAttributes}
        button={{ show: true, label: '+ Groups' }}
        searchParameter="name"
        additionalAction={additionalAction}
      />
    </div>
  );
};

export default StaffManagementList;
