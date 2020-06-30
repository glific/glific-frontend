import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  List,
  styled,
  Button,
  TextField,
  NoSsr,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import styles from './SideMenus.module.css';

import { sideDrawerMenus } from '../../../../../config/menu';
import ListIcon from '../../../ListIcon/ListIcon';

export interface SideMenusProps {}

const useStyles = makeStyles({
  listStyle: {
    display: 'inline-block',
    width: '100%',
  },
  itemRoot: {
    disableRipple: true,
    borderRadius: '12px',
    padding: '5px 0px 5px 5px',
    width: '90%',
    margin: 'auto',
    '&$selected': {
      background: '#69b37d',
    },
    '&:hover': {
      background: '#ededed',
    },
    '&$selected:hover': {
      background: '#429e65',
    },
  },
  selected: {},
});

const SideMenus: React.SFC<SideMenusProps> = () => {
  const classes = useStyles();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuList = sideDrawerMenus.map((menu, i) => {
    return (
      <ListItem
        button
        disableRipple={true}
        selected={selectedIndex === i}
        classes={{ root: classes.itemRoot, selected: classes.selected }}
        key={menu.icon}
        component={NavLink}
        to={menu.path}
        onClick={() => setSelectedIndex(i)}
      >
        <ListItemIcon>
          <ListIcon icon={menu.icon} />
        </ListItemIcon>
        <ListItemText primary={menu.title} />
      </ListItem>
    );
  });

  return <List className={classes.listStyle}>{menuList}</List>;
};

export default SideMenus;
