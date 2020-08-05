import React from 'react';
import { USER_COUNT, FILTER_USERS } from '../../../graphql/queries/StaffManagement';
import { DELETE_USER, ADD_USER_TO_GROUP } from '../../../graphql/mutations/StaffManagement';
import styles from './StaffManagementList.module.css';
import { ReactComponent as StaffIcon } from '../../../assets/images/icons/StaffManagement/Active.svg';
import { List } from '../../List/List';

export interface StaffManagementProps {}

export const StaffManagementList: React.SFC<StaffManagementProps> = () => {
  const columnNames = ['NAME', 'PHONE NO.', 'GROUPS', 'ACTIONS'];
  const columnStyles = [styles.Name, styles.Phone, styles.Group, styles.Actions];
  const staffIcon = <StaffIcon />;

  const getColumns = ({ name, phone, groups }: any) => ({
    name: getName(name),
    phone: getPhone(phone),
    group: getGroups(groups),
  });

  const queries = {
    countQuery: USER_COUNT,
    filterItemsQuery: FILTER_USERS,
    deleteItemQuery: DELETE_USER,
    secondButtonQuery: ADD_USER_TO_GROUP,
  };

  const getName = (text: string) => {
    return <p className={styles.TableText}>{text}</p>;
  };

  const getPhone = (text: string) => {
    return <p className={styles.TableText}>{text}</p>;
  };

  const getGroups = (text: string) => {
    return <p className={styles.TableText}>{text}</p>;
  };

  const dialogMessage = 'hello';

  const columnAttributes = {
    columnNames: columnNames,
    columns: getColumns,
    columnStyles: columnStyles,
  };

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
        buttonLabel="Groups"
        searchParameter="name"
      />
    </div>
  );
};

export default StaffManagementList;
