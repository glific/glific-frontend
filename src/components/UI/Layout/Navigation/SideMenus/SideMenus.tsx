import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ListItem, ListItemIcon, ListItemText, List } from '@material-ui/core';
import { useLazyQuery } from '@apollo/client';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { GET_NOTIFICATIONS_COUNT } from 'graphql/queries/Notifications';
import ListIcon from 'components/UI/ListIcon/ListIcon';
import { getSideDrawerMenus } from 'context/role';
import styles from './SideMenus.module.css';

export interface SideMenusProps {
  opened: boolean;
}

const SideMenus = ({ opened }: SideMenusProps) => {
  const location = useLocation();
  const { t } = useTranslation();

  // handle count for notifictions
  const [notificationCount, setNotificationCount] = useState<any>();
  const [getNotificationCount] = useLazyQuery(GET_NOTIFICATIONS_COUNT, {
    variables: {
      filter: {
        is_read: false,
        severity: 'critical',
      },
    },
    fetchPolicy: 'cache-and-network',
    onCompleted: (countData) => {
      setNotificationCount(countData.countNotifications);
    },
  });

  useEffect(() => {
    getNotificationCount();
  }, []);

  // let's get count specific to menu paths
  const getCount = (menuPath: any) => {
    if (menuPath === '/notifications') {
      // get menu notification count
      return notificationCount;
    }

    return 0;
  };

  const menuObj: any[] = getSideDrawerMenus();

  const menuList = menuObj.map((menu) => {
    const isSelected = location.pathname.startsWith(menu.path);
    let redirectPath = menu.path;
    if (menu.url) {
      redirectPath = { pathname: menu.url };
    }

    return (
      <ListItem
        button
        disableRipple
        selected={isSelected}
        className={clsx({
          [styles.OpenItem]: opened,
          [styles.ClosedItem]: !opened,
        })}
        classes={{
          root: styles.IconItem,
          selected: styles.SelectedItem,
        }}
        key={menu.icon}
        component={NavLink}
        to={redirectPath}
        {...(menu.url ? { target: '_blank', url: menu.url } : {})}
      >
        <ListItemIcon className={styles.ListItemIcon}>
          <ListIcon
            icon={menu.icon}
            count={menu.badge ? getCount(menu.path) : 0}
            showBadge={menu.badge ? menu.badge : false}
          />
        </ListItemIcon>
        {opened ? (
          <ListItemText
            disableTypography
            data-testid="list-item"
            className={clsx(styles.Text, {
              [styles.SelectedText]: isSelected,
              [styles.UnselectedText]: !isSelected,
            })}
            primary={t(menu.title)}
          />
        ) : null}
      </ListItem>
    );
  });

  return (
    <List className={styles.List} data-testid="list">
      {menuList}
    </List>
  );
};

export default SideMenus;
