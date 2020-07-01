import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ListItem, ListItemIcon, ListItemText, List } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import styles from './SideMenus.module.css';

import { sideDrawerMenus } from '../../../../../config/menu';
import ListIcon from '../../../ListIcon/ListIcon';

export interface SideMenusProps {
  opened: boolean;
}

const useStyles = makeStyles({
  listStyle: {
    display: 'inline-block',
    width: '100%',
  },
  itemRoot: {
    disableRipple: true,
    borderRadius: '12px',
    padding: '7px 0px 7px 9px',
    width: '90%',
    margin: '0 5px 0 5px',
    '&$selected': {
      background: '#E2F1EA',
    },
    '&:hover': {
      background: '#ededed',
    },
    '&$selected:hover': {
      background: '#c3ebd8',
    },
  },
  selected: {},
  // Current doesn't totally work-- selected + hover do not changed colors.
  closedRoot: {
    disabledRipple: true,
    borderRadius: '12px',
    padding: '12px 9px 12px 9px',
    width: '60%',
    margin: '0 0 0 5px',
    '&$selected': {
      background: '#E2F1EA',
    },
    '&:hover': {
      background: '#ededed',
    },
    '&$selected:hover': {
      background: '#429e65',
    },
  },
  closedSelected: {},
  SelectedText: {
    color: '#119656',
    fontFamily: 'Heebo, sans-serif',
  },
  UnselectedText: {
    color: '#93A29B',
    fontFamily: 'Heebo, sans-serif',
  },
});

const SideMenus: React.SFC<SideMenusProps> = (props) => {
  const classes = useStyles();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuList = sideDrawerMenus.map((menu, i) => {
    return (
      <ListItem
        button
        disableRipple={true}
        selected={selectedIndex === i}
        classes={
          props.opened
            ? { root: classes.itemRoot, selected: classes.selected }
            : { root: classes.closedRoot, selected: classes.closedSelected }
        }
        key={menu.icon}
        component={NavLink}
        to={menu.path}
        onClick={() => setSelectedIndex(i)}
      >
        <ListItemIcon>
          <ListIcon icon={menu.icon} selected={selectedIndex === i} />
        </ListItemIcon>
        {props.opened ? (
          <ListItemText
            disableTypography
            className={selectedIndex === i ? classes.SelectedText : classes.UnselectedText}
            primary={menu.title}
          />
        ) : null}
      </ListItem>
    );
  });

  return <List className={classes.listStyle}>{menuList}</List>;
};

export default SideMenus;
