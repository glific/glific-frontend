import React from 'react';
import { USER_COUNT, DELETE_USER, FILTER_USERS } from '../../../graphql/queries/StaffManagement';
import styles from './StaffManagementList.module.css';
import { ReactComponent as StaffIcon } from '../../../assets/images/icons/StaffManagement/Active.svg';
import { List } from '../../List/List';
import { getgroups } from 'process';

export interface StaffManagementProps {}

export const StaffManagementList: React.SFC<StaffManagementProps> = () => {
  const columnNames = ['NAME', 'PHONE NO.', 'GROUP', 'ACTIONS'];
  const columnStyles = [styles.Name, styles.Phone, styles.Role, styles.Actions];
  const staffIcon = <StaffIcon className={styles.TagIcon} />;

  const getColumns = ({ name, phone, group }: any) => ({
    name: getName(name),
    phone: getPhone(phone),
    group: getGroup(group),
  });

  const queries = {
    countQuery: USER_COUNT,
    filterItemsQuery: FILTER_USERS,
    deleteItemQuery: DELETE_USER,
  };

  const getName = (text: string) => {
    return <p className={styles.TableText}>{text}</p>;
  };

  const getPhone = (text: string) => {
    return <p className={styles.TableText}>{text}</p>;
  };

  const getGroup = (text: string) => {
    return <p className={styles.TableText}>{text}</p>;
  };

  const dialogMessage = 'hello';

  const columnAttributes = {
    columnNames: columnNames,
    columns: getColumns,
    columnStyles: columnStyles,
  };

  const searchKey = {
    filter: {
      name: null,
    },
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
        filterKey="name"
      />
    </div>
  );
};

export default StaffManagementList;
