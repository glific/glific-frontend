import React from 'react';
import { AppBar, Toolbar, Typography } from '@material-ui/core';
import AccountCircleSharpIcon from '@material-ui/icons/AccountCircleSharp';

import styles from './Header.module.css';

export interface HeaderProps {}

export const Header: React.SFC<HeaderProps> = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography className={styles.TypographyStyle}>Glific</Typography>
        <AccountCircleSharpIcon />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
