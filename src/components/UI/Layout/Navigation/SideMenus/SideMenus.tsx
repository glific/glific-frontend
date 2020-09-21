import React, { useEffect, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ListItem, ListItemIcon, ListItemText, List } from '@material-ui/core';
import clsx from 'clsx';

import ListIcon from '../../../ListIcon/ListIcon';
import styles from './SideMenus.module.css';
import {
  getUserRole,
  setUserRole,
  getRoleBasedAccess,
  RoleContext,
} from '../../../../../context/role';
import { GET_CURRENT_USER } from '../../../../../graphql/queries/User';
import { useLazyQuery } from '@apollo/client';

export interface SideMenusProps {
  opened: boolean;
}

const SideMenus: React.SFC<SideMenusProps> = (props) => {
  const location = useLocation();
  const { setRole } = useContext(RoleContext);

  // get the information on current user
  const [getCurrentUser, { data: userData }] = useLazyQuery(GET_CURRENT_USER);

  if (userData) {
    setUserRole(userData.currentUser.user.roles);
    setRole(userData.currentUser.user.roles);
  }

  const role: any = getUserRole() ? getUserRole() : [];

  useEffect(() => {
    if (role.length === 0) getCurrentUser();
  }, []);

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
