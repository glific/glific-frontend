import React from 'react';

import styles from './UserProfile.module.css';
import { Profile } from '../Profile';

export interface UserProfileProps {}

export const UserProfile: React.SFC<UserProfileProps> = () => (
  <div className={styles.UserProfile} data-testid="UserProfile">
    <Profile profileType="User" redirectionLink="chat/" />
  </div>
);
