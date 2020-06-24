import React from 'react';
import { Toolbar, Typography, IconButton } from '@material-ui/core';

import styles from './ContactBar.module.css';
import ListIcon from '../../../../components/UI/ListIcon/ListIcon';

export interface ContactBarProps {
  contactName: string;
}

export const ContactBar: React.SFC<ContactBarProps> = (props) => {
  return (
    <Toolbar className={styles.ContactBar} color="primary">
      <Typography variant="h6" noWrap data-testid="name">
        {props.contactName}
      </Typography>
      <IconButton color="primary" aria-label="more actions" component="span">
        <ListIcon icon="verticalMenu" />
      </IconButton>
    </Toolbar>
  );
};

export default ContactBar;
