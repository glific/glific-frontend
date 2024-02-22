import { useState, useEffect, forwardRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  List,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { useLazyQuery } from '@apollo/client';
import LinkIcon from 'assets/images/icons/UrlLink.svg?react';
import { GET_NOTIFICATIONS_COUNT } from 'graphql/queries/Notifications';
import ListIcon from 'components/UI/ListIcon/ListIcon';
import { getSideDrawerMenus } from 'context/role';
import styles from './SideMenus.module.css';
import { useTranslation } from 'react-i18next';
import { Menu } from 'config/menu';

export interface SideMenusProps {
  opened: boolean;
}

const AddAccordian = ({ defaultExpanded, summary, details, opened }: any) => (
  <Accordion className={styles.Accordion} defaultExpanded={defaultExpanded}>
    <AccordionSummary
      className={styles.AccordionSummary}
      classes={{
        content: styles.AccordionSummaryContent,
        expanded: styles.AccordionSummaryContentExpanded,
      }}
    >
      {summary}
    </AccordionSummary>
    <AccordionDetails className={opened ? styles.AccordionDetails : styles.AccordionDetailsClosed}>
      {details}
    </AccordionDetails>
  </Accordion>
);

const AnchorLink = forwardRef((props, ref: any) => <a {...props} ref={ref} />);

const getCurrentMenu = (menus: Menu[], path: string) => {
  for (const item of menus) {
    if (item.path === path) {
      return undefined; // current path is already a parent
    }

    if (item.children) {
      for (const child of item.children) {
        if (child.path === path) {
          return item.path; // current path is a child, return parent path
        }
      }
    }
  }
};

const SideMenus = ({ opened }: SideMenusProps) => {
  const menuObj = getSideDrawerMenus();
  const location = useLocation();
  const [parentMenu, setParentMenu] = useState(getCurrentMenu(menuObj, location.pathname));

  const { t } = useTranslation();

  // handle count for notifictions
  const [notificationCount, setNotificationCount] = useState(0);
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

  const links = menuObj.filter((menu) => menu.url);
  const menuList = menuObj.filter((menu) => !menu.url);

  let menuToDisplay = menuList;

  const linksDisplay = links.map((link) => {
    const listItemButton = (
      <ListItemButton
        disableRipple
        className={opened ? styles.OpenItem : styles.ClosedItem}
        classes={{
          root: styles.IconItem,
          selected: styles.SelectedItem,
        }}
        key={link.title}
        component={AnchorLink}
        {...{ target: '_blank', href: link.url, rel: 'noopener noreferrer' }}
      >
        <ListItemIcon className={styles.ListItemIcon}>
          <ListIcon icon={link.icon} />
        </ListItemIcon>
        {opened && (
          <>
            <ListItemText
              disableTypography
              data-testid="list-item"
              className={styles.UnselectedText}
              primary={t(link.title as any)}
            />
            <LinkIcon />
          </>
        )}
      </ListItemButton>
    );
    return listItemButton;
  });

  const menuListDisplay = menuToDisplay
    .filter((menu) => !menu.show)
    .map((menu) => {
      const isSelected = parentMenu === menu.path;
      let parentredirectPath = menu.path;

      const subMenu =
        menu.children &&
        menu.children
          .filter((menu) => !menu.show)
          .map((menu) => {
            const isSelected = location.pathname.startsWith(menu.path);
            let redirectPath = menu.path;

            const listItemButton = (
              <div
                className={isSelected ? styles.IconItemActiveSubmenu : styles.IconItemSubmenu}
                key={'child' + menu.title}
              >
                <ListItemButton
                  disableRipple
                  selected={isSelected}
                  className={opened ? styles.OpenItemSubMenu : styles.ClosedItem}
                  classes={{
                    root: styles.IconItem,
                    selected: styles.SelectedItem,
                  }}
                  onClick={() => {
                    setParentMenu(parentredirectPath);
                  }}
                  component={NavLink}
                  to={redirectPath}
                >
                  <ListItemIcon className={styles.ListItemIcon}>
                    <ListIcon selected={isSelected} icon={menu.icon} />
                  </ListItemIcon>
                  {opened && (
                    <ListItemText
                      disableTypography
                      data-testid="list-item"
                      className={isSelected ? styles.SelectedText : styles.UnselectedText}
                      primary={t(menu.title as any)}
                    />
                  )}
                </ListItemButton>
              </div>
            );

            return listItemButton;
          });

      const links = menu.children ? {} : { component: NavLink, to: parentredirectPath };
      let listItemButton = (
        <ListItemButton
          disableRipple
          selected={menu.children ? false : isSelected}
          className={opened ? styles.OpenItem : styles.ClosedItem}
          onClick={() => {
            setParentMenu(menu.path);
          }}
          classes={{
            root: styles.IconItem,
            selected: styles.SelectedItem,
          }}
          key={menu.title}
          {...links}
        >
          <ListItemIcon className={styles.ListItemIcon}>
            <ListIcon
              selected={menu.children ? false : isSelected}
              icon={menu.icon}
              count={menu.showBadge ? notificationCount : undefined}
            />
          </ListItemIcon>
          {opened && (
            <ListItemText
              disableTypography
              data-testid="list-item"
              className={
                menu.children
                  ? styles.UnselectedText
                  : isSelected
                    ? styles.SelectedText
                    : styles.UnselectedText
              }
              primary={t(menu.title as any)}
            />
          )}
        </ListItemButton>
      );

      listItemButton = subMenu ? (
        <div key={menu.title}>
          <AddAccordian
            summary={listItemButton}
            details={subMenu}
            defaultExpanded={isSelected}
            opened={opened}
          />
        </div>
      ) : (
        listItemButton
      );

      return listItemButton;
    });

  return (
    <List className={styles.List} data-testid="list">
      <div>{menuListDisplay}</div>
      <Divider className={styles.Divider} />
      {linksDisplay}
    </List>
  );
};

export default SideMenus;
