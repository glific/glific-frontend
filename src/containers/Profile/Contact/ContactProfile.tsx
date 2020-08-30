import React from 'react';
import styles from './ContactProfile.module.css';
import { Profile } from '../Profile';

export interface ContactProfileProps {
  match: any;
}

export const ContactProfile: React.SFC<ContactProfileProps> = (props) => {
  return (
    <div className={styles.ContactProfile} data-testid="ContactProfile">
      <Profile {...props} />
    </div>
  );
};
