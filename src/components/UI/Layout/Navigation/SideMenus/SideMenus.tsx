import { useState, useEffect, forwardRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ListItemButton, ListItemIcon, ListItemText, List } from '@mui/material';
import { useLazyQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { GET_NOTIFICATIONS_COUNT } from 'graphql/queries/Notifications';
import ListIcon from 'components/UI/ListIcon/ListIcon';
import { getSideDrawerMenus } from 'context/role';
import styles from './SideMenus.module.css';
import Menu from 'components/UI/Menu/Menu';

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
  // we should check for menu path if we have badges for other items.
  // For now we have only one badge for notifications so returning that only

  const getCount = () => notificationCount;

  const menuObj: any[] = getSideDrawerMenus();

  const menuList = menuObj.map((menu) => {
    const isSelected = location.pathname.startsWith(menu.path);
    let redirectPath = menu.path;
    if (menu.url) {
      redirectPath = { pathname: menu.url };
    }

    const listItemButton = (
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
            count={menu.badge ? getCount() : 0}
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

    if (menu.subMenu && menu.subMenu.length) {
      const subMenu = menu.subMenu
        .filter((item: any) => !item.show)
        .map((item: any) => ({
          ...item,
          spacing: false,
          icon: (
            <ListItemIcon className={styles.ListItemIcon}>
              <ListIcon icon={item.icon} />
            </ListItemIcon>
          ),
        }));
      return (
        <Menu menus={subMenu} eventType="MouseEnter" placement={'right-start'}>
          {listItemButton}
        </Menu>
      );
    }

    return listItemButton;
  });

  return (
    <List className={styles.List} data-testid="list">
      {menuList}
    </List>
  );
};

export default SideMenus;
