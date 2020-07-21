import React from 'react';
import { USER_COUNT, DELETE_USER, FILTER_USERS } from '../../../graphql/queries/StaffManagement';
import styles from './StaffManagement.module.css';
import { Typography } from '@material-ui/core';
import { ReactComponent as TagIcon } from '../../../assets/images/icons/Tags/Selected.svg';
import { List } from '../../../containers/List/List';

export interface StaffManagementProps {}

export const StaffManagement: React.SFC<StaffManagementProps> = () => {
  const columnNames = ['ID', 'NAME', 'PHONE', 'ROLE'];
  const columnStyles = [styles.Id, styles.Name, styles.Phone, styles.Role];
  const tagIcon = <TagIcon className={styles.TagIcon} />;

  const getColumns = ({ id, name, phone, role }: any) => ({
    id: getID(id),
    name: getName(name),
    phone: getPhone(phone),
    roles: getRoles(role),
  });

  const queries = {
    countQuery: USER_COUNT,
    filterItemsQuery: FILTER_USERS,
    deleteItemQuery: DELETE_USER,
  };

  const getID = (text: string) => {
    return <p className={styles.Title}>{text}</p>;
  };

  const getName = (text: string) => {
    return <p className={styles.TableText}>{text}</p>;
  };

  const getPhone = (text: string) => {
    return <p className={styles.TableText}>{text}</p>;
  };

  const getRoles = (text: string) => {
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
      <div className={styles.Header}>
        <Typography variant="h5">Staff Management</Typography>
      </div>
      <List
        title="Staff Management"
        listItem="users"
        listItemName="user"
        pageLink="staff-management"
        listIcon={tagIcon}
        dialogMessage={dialogMessage}
        {...queries}
        {...columnAttributes}
      />
    </div>
  );
};

export default StaffManagement;
