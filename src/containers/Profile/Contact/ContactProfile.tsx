import React from 'react';
import styles from './ContactProfile.module.css';
import { Profile } from '../Profile';

export interface ContactProfileProps {
  match: any;
}

export const ContactProfile: React.SFC<ContactProfileProps> = (props) => {
  return (
    <div className={styles.ContactProfile} data-testid="ContactProfile">
      <Profile
        {...props}
        profileType="Contact"
        redirectionLink={`chat/${props.match.params.id}`}
        afterDelete={{ link: '/chat' }}
      />
    </div>
  );
};
