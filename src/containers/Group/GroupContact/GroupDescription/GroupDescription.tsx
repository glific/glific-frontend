import React from 'react';
import styles from './GroupDescription.module.css';

export const GroupDescription = ({ users = [], description }: any) => {
  const userList = (
    <ul className={styles.UserList}>
      {users.map((user: any) => (
        <li>{user.name}</li>
      ))}
    </ul>
  );
  return (
    <div className={styles.DescriptionContainer}>
      <h2 className={styles.Title}>Description</h2>
      <p className={styles.Description}>{description}</p>

      <div className={styles.Something}>
        <span>Members</span>
      </div>

      <div>{userList}</div>
    </div>
  );
};
