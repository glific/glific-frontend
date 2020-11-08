import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ListItem, ListItemIcon, ListItemText, List } from '@material-ui/core';
import clsx from 'clsx';

import ListIcon from '../../../ListIcon/ListIcon';
import styles from './SideMenus.module.css';
import { getRoleBasedAccess } from '../../../../../context/role';

export interface SideMenusProps {
  opened: boolean;
}

const SideMenus: React.SFC<SideMenusProps> = (props) => {
  const location = useLocation();

  const menu: any[] = getRoleBasedAccess();

  const menuList = menu.map((menu, i) => {
    let isSelected = location.pathname.startsWith(menu.path);
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
      >
        <ListItemIcon className={styles.ListItemIcon}>
          <ListIcon icon={menu.icon} />
        </ListItemIcon>
        {props.opened ? (
          <ListItemText
            disableTypography
            data-testid="list-item"
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
