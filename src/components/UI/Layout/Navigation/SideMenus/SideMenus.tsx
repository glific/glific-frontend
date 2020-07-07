import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ListItem, ListItemIcon, ListItemText, List } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

import { sideDrawerMenus } from '../../../../../config/menu';
import ListIcon from '../../../ListIcon/ListIcon';
import styles from './SideMenus.module.css';
import { StylesProvider } from '@material-ui/core/styles';

export interface SideMenusProps {
  opened: boolean;
}

const SideMenus: React.SFC<SideMenusProps> = (props) => {
  const [selectedItem, setSelectedItem] = useState('');

  // This may not be the best way to implement this functionality (especially if the endpoints change in the URL),
  // but I couldn't find a better way to do this atm.
  const getCurrMenuItem = () => {
    let currUrl = window.location.pathname;
    let pathName = currUrl.split('/')[1]; // Gets the first part of the pathname.
    return '/'.concat(pathName);
  };

  useEffect(() => {
    setSelectedItem(getCurrMenuItem());
  }, []);

  const menuList = sideDrawerMenus.map((menu, i) => {
    let isSelected = menu.path === selectedItem;
    return (
      <ListItem
        button
        disableRipple={true}
        selected={isSelected}
        className={clsx({
          [styles.OpenItem]: props.opened,
          [styles.ClosedItem]: !props.opened,
        })}
        classes={{
          root: styles.IconItem,
          selected: styles.SelectedItem,
        }}
        key={menu.icon}
        component={NavLink}
        to={menu.path}
        onClick={() => setSelectedItem(menu.path)}
      >
        <ListItemIcon>
          <ListIcon icon={menu.icon} selected={isSelected} />
        </ListItemIcon>
        {props.opened ? (
          <ListItemText
            disableTypography
            className={clsx(styles.Text, {
              [styles.SelectedText]: isSelected,
              [styles.UnselectedText]: !isSelected,
            })}
            primary={menu.title}
          />
        ) : null}
      </ListItem>
    );
  });

  return <List className={styles.List}>{menuList}</List>;
};

export default SideMenus;
