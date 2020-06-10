import React from 'react';
import { Typography } from '@material-ui/core';

import styles from './ContactBar.module.css';
import ListIcon from '../../../../components/UI/ListIcon/ListIcon';

export interface ContactBarProps {
  contactName: string;
}

export const ContactBar: React.SFC<ContactBarProps> = (props) => {
  return (
    <div className={styles.ContactBar}>
      <Typography variant="h6" noWrap>
        {props.contactName}
        <div className={styles.MenuIcon}>
          <ListIcon icon="verticalmenu" />
        </div>
      </Typography>
    </div>
  );
};

export default ContactBar;
