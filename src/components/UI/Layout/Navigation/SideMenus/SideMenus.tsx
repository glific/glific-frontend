import React, { useState, useEffect, forwardRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ListItemButton, ListItemIcon, ListItemText, List } from '@mui/material';
import { useLazyQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { GET_NOTIFICATIONS_COUNT } from 'graphql/queries/Notifications';
import ListIcon from 'components/UI/ListIcon/ListIcon';
import { getSideDrawerMenus } from 'context/role';
import styles from './SideMenus.module.css';

export interface SideMenusProps {
  opened: boolean;
}

const AnchorLink = forwardRef((props, ref: any) => <a {...props} ref={ref} />);

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
      <ListItemButton
        disableRipple
        selected={isSelected}
        className={opened ? styles.OpenItem : styles.ClosedItem}
        classes={{
          root: styles.IconItem,
          selected: styles.SelectedItem,
        }}
        key={menu.icon}
        component={menu.url ? AnchorLink : NavLink}
        to={redirectPath}
        {...(menu.url ? { target: '_blank', href: menu.url, rel: 'noopener noreferrer' } : {})}
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
            className={isSelected ? styles.SelectedText : styles.UnselectedText}
            primary={t(menu.title)}
          />
        ) : null}
      </ListItemButton>
    );
  });

  return (
    <List className={styles.List} data-testid="list">
      {menuList}
    </List>
  );
};

export default SideMenus;
