import React, { useState } from 'react';
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  console.log(window.location.href);
  const menuList = sideDrawerMenus.map((menu, i) => {
    return (
      <ListItem
        button
        disableRipple={true}
        selected={selectedIndex === i}
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
        onClick={() => setSelectedIndex(i)}
      >
        <ListItemIcon>
          <ListIcon icon={menu.icon} selected={selectedIndex === i} />
        </ListItemIcon>
        {props.opened ? (
          <ListItemText
            disableTypography
            className={clsx(styles.Text, {
              [styles.SelectedText]: selectedIndex === i,
              [styles.UnselectedText]: selectedIndex !== i,
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
