import React from 'react';
import { USER_COUNT, DELETE_USER, FILTER_USERS } from '../../../graphql/queries/StaffManagement';
import styles from './StaffManagementList.module.css';
import { ReactComponent as StaffIcon } from '../../../assets/images/icons/StaffManagement/Active.svg';
import { List } from '../../List/List';

export interface StaffManagementProps {}

export const StaffManagementList: React.SFC<StaffManagementProps> = () => {
  const columnNames = ['NAME', 'PHONE', 'ACTIONS'];
  const columnStyles = [styles.Name, styles.Phone, styles.Role];
  const staffIcon = <StaffIcon className={styles.TagIcon} />;

  const getColumns = ({ id, name, phone, role }: any) => ({
    name: getName(name),
    phone: getPhone(phone),
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
        // searchKey={searchKey}
      />
    </div>
  );
};

export default StaffManagementList;
