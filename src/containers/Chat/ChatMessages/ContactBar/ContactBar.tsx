import React from 'react';
import { Toolbar, Typography } from '@material-ui/core';

import styles from './ContactBar.module.css';

export interface ContactBarProps {
  contactName: string;
}

export const ContactBar: React.SFC<ContactBarProps> = (props) => {
  return (
    <Toolbar className={styles.ContactBar} color="primary">
      <Typography className={styles.Title} variant="h6" noWrap data-testid="name">
        {props.contactName}
      </Typography>
    </Toolbar>
  );
};

export default ContactBar;
