import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USERS_QUERY } from '../../../graphql/queries/StaffManagement';
import { Pager } from '../../../components/UI/Pager/Pager';
import styles from './StaffManagement.module.css';
import { Typography } from '@material-ui/core';

export interface StaffManagementProps {}

interface TableVals {
  pageNum: number;
  pageRows: number;
  sortCol: string;
  sortDirection: 'asc' | 'desc';
}

export const StaffManagement: React.SFC<StaffManagementProps> = () => {
  const users = useQuery<any>(GET_USERS_QUERY).data;
  const columnNames = ['ID', 'NAME', 'PHONE', 'ROLE'];
  const [tableVals, setTableVals] = useState<TableVals>({
    pageNum: 0,
    pageRows: 10,
    sortCol: columnNames[0],
    sortDirection: 'asc',
  });
  const columnStyles = [styles.Id, styles.Name, styles.Phone, styles.Role];
  const handleTableChange = () => {
    console.log('hi');
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

  function formatUsers(users: Array<any>) {
    console.log(users);
    console.log(Object.keys(users));
    console.log(Object.values(users));
    let userObject = users[0];
    return userObject.map((user: any) => {
      console.log(user);
      console.log(Object.keys(user));
      return {
        id: getID(user.id),
        name: getName(user.name),
        phone: getPhone(user.phone),
        role: getRoles(user.roles),
      };
    });
  }

  let userList: any;
  if (users) {
    let usersArray = Object.values(users);
    console.log(usersArray);
    userList = formatUsers(usersArray);
  }
  console.log(userList);
  return (
    <div>
      <div className={styles.Header}>
        <Typography variant="h5">Staff Management</Typography>
      </div>
      {userList ? (
        <Pager
          columnStyles={columnStyles}
          data={userList}
          columnNames={columnNames}
          totalRows={userList.length}
          tableVals={tableVals}
          handleTableChange={handleTableChange}
        />
      ) : null}
    </div>
  );
};

export default StaffManagement;
