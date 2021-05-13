import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ListItem, ListItemIcon, ListItemText, List } from '@material-ui/core';
import { useMutation, useQuery } from '@apollo/client';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { GET_NOTIFICATIONS_COUNT } from '../../../../../graphql/queries/Notifications';
import { MARK_NOTIFICATIONS_AS_READ } from '../../../../../graphql/mutations/Notifications';
import styles from './SideMenus.module.css';
import ListIcon from '../../../ListIcon/ListIcon';
import { getSideDrawerMenus } from '../../../../../context/role';

export interface SideMenusProps {
  opened: boolean;
}

const SideMenus: React.SFC<SideMenusProps> = (props) => {
  const location = useLocation();
  const { t } = useTranslation();
  const [notificationCount, setNotificationCount] = useState<any>();

  const { data: countData } = useQuery(GET_NOTIFICATIONS_COUNT, {
    variables: {
      filter: {
        is_read: false,
      },
    },
  });

  // load page and fetch count from api
  useEffect(() => {
    if (countData && countData.countNotifications > 0) {
      setNotificationCount(countData.countNotifications);
    }
  }, [countData]);

  // when count is updated
  useEffect(() => {
    if (notificationCount > 0) {
      setNotificationCount(notificationCount);
    }
  }, [notificationCount]);

  const [markNotificationAsRead] = useMutation(MARK_NOTIFICATIONS_AS_READ, {
    onCompleted: (data) => {
      if (data.markNotificationAsRead) {
        setNotificationCount(0);
      }
    },
  });

  const markAsRead = () => {
    if (notificationCount) {
      markNotificationAsRead();
    }
  };

  const menuObj: any[] = getSideDrawerMenus();

  const menuList = menuObj.map((menu) => {
    const isSelected = location.pathname.startsWith(menu.path);
    return (
      <ListItem
        button
        disableRipple
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
        onClick={markAsRead}
      >
        <ListItemIcon className={styles.ListItemIcon}>
          {notificationCount ? (
            <ListIcon icon={menu.icon} count={notificationCount} />
          ) : (
            <ListIcon icon={menu.icon} />
          )}
        </ListItemIcon>
        {props.opened ? (
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
