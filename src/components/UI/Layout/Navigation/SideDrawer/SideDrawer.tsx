import React, { useState } from 'react';
import {
  Hidden,
  Drawer,
  makeStyles,
  createStyles,
  Theme,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import clsx from 'clsx';
import IconButton from '@material-ui/core/IconButton';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Menu from 'components/UI/Menu/Menu';
import * as constants from 'common/constants';
import InactiveStaffIcon from 'assets/images/icons/StaffManagement/Inactive.svg';
import ActiveStaffIcon from 'assets/images/icons/StaffManagement/Active.svg';
import InactiveUserIcon from 'assets/images/icons/User/Inactive.svg';
import ActiveUserIcon from 'assets/images/icons/User/Active.svg';
import ActiveIcon from 'assets/images/icons/Settings/Active.svg';
import InactiveIcon from 'assets/images/icons/Settings/Inactive.svg';
import GlificLogo from 'assets/images/logo/Logo.svg';
import { getUserRolePermissions, getUserAccountMenus, getStaffManagementMenus } from 'context/role';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';
import { WalletBalance } from 'containers/WalletBalance/WalletBalance';
import SideMenus from '../SideMenus/SideMenus';
import styles from './SideDrawer.module.css';

export interface SideDrawerProps {
  fullOpen: boolean;
  setFullOpen: any;
}

const drawerWidth = constants.SIDE_DRAWER_WIDTH;

const themeUI = createTheme({
  typography: {
    h6: {
      fontSize: 24,
      fontFamily: 'Tenor Sans, sans-serif',
      color: '#0D6B3D',
    },
  },
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      zIndex: 1000,
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
    navClose: {
      width: '0px',
      [theme.breakpoints.up('sm')]: {
        width: '72px',
      },
    },
    drawerOpen: {
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: drawerWidth,
      },
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
      width: '0px',
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9) + 1,
      },
    },
    toolbar: {
      display: 'flex',
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
    drawerPaper: {},
    outerBox: {
      display: 'flex',
      width: '100%',
      justifyContent: 'space-between',
    },
    anotherToolBar: {
      padding: '0px',
    },
    title: {
      alignSelf: 'center',
      margin: '0 0 0 15px',
    },
    iconButton: {
      margin: '0 10px 0 0',
    },
    closedIcon: {
      margin: '12px 12px 12px 15px',
    },
    BottomMenus: {
      position: 'absolute',
      bottom: '50px',
      display: 'flex',
      width: '100%',
      paddingLeft: '8px',
    },
    BottomMenusVertical: {
      flexFlow: 'column',
    },
  })
);

export const SideDrawer: React.SFC<SideDrawerProps> = ({ fullOpen, setFullOpen }) => {
  const location = useLocation();
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  const drawer = (
    <div>
      <Toolbar className={classes.anotherToolBar}>
        {fullOpen ? (
          <div className={classes.outerBox}>
            <ThemeProvider theme={themeUI}>
              <Typography variant="h6" className={classes.title}>
                <img src={GlificLogo} className={styles.GlificLogo} alt="Glific" />
              </Typography>
            </ThemeProvider>
            <IconButton
              className={classes.iconButton}
              onClick={() => setFullOpen(false)}
              data-testid="drawer-button"
            >
              <MenuIcon />
            </IconButton>
          </div>
        ) : (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            data-testid="drawer-button-closed"
            style={{ margin: 'auto' }}
            onClick={() => setFullOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>
      <SideMenus opened={fullOpen} />
    </div>
  );

  const container = window !== undefined ? () => window.document.body : undefined;

  let settingMenu;
  const userRolePermissions = getUserRolePermissions();
  if (userRolePermissions.accessSettings) {
    settingMenu = (
      <div>
        <Tooltip title={t('Settings')} placement="top">
          <Link to="/settings">
            <IconButton data-testid="settingsMenu">
              <img
                src={location.pathname === '/settings' ? ActiveIcon : InactiveIcon}
                className={styles.UserIcon}
                alt="settings"
              />
            </IconButton>
          </Link>
        </Tooltip>
      </div>
    );
  }

  // set the appropriate classes to display bottom menus correctly
  const bottonMenuClasses = [classes.BottomMenus];
  if (!fullOpen) {
    bottonMenuClasses.unshift(classes.BottomMenusVertical);
  }

  return (
    <nav
      className={clsx({
        [classes.drawer]: fullOpen,
        [classes.navClose]: !fullOpen,
      })}
      aria-label="navigation menus"
      data-testid="navbar"
    >
      <Hidden smUp implementation="css">
        <Drawer
          container={container}
          variant="temporary"
          anchor={themeUI.direction === 'rtl' ? 'right' : 'left'}
          open={mobileOpen}
          onClose={() => {
            setMobileOpen(!mobileOpen);
          }}
          classes={{
            paper: classes.drawerPaper,
          }}
          ModalProps={{
            keepMounted: true,
          }}
        >
          {drawer}
        </Drawer>
      </Hidden>
      <Drawer
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: fullOpen,
          [classes.drawerClose]: !fullOpen,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: fullOpen,
            [classes.drawerClose]: !fullOpen,
          }),
        }}
        variant="permanent"
      >
        <div className={bottonMenuClasses.join(' ')}>
          {settingMenu}
          <div data-testid="bottom-menu" aria-hidden="true">
            <Menu menus={getStaffManagementMenus()} eventType="Click">
              <IconButton data-testid="staffManagementMenu">
                <Tooltip title="" placement="top">
                  <img
                    src={
                      [
                        '/collection',
                        '/staff-management',
                        '/blocked-contacts',
                        '/consulting-hours',
                      ].includes(location.pathname)
                        ? ActiveStaffIcon
                        : InactiveStaffIcon
                    }
                    className={styles.StaffIcon}
                    alt="staff icon"
                  />
                </Tooltip>
              </IconButton>
            </Menu>
          </div>
          <div>
            <Menu menus={getUserAccountMenus()} eventType="Click">
              <IconButton data-testid="profileMenu">
                <Tooltip title="" placement="top">
                  <img
                    src={location.pathname === '/user-profile' ? ActiveUserIcon : InactiveUserIcon}
                    className={styles.UserIcon}
                    alt="user icon"
                  />
                </Tooltip>
              </IconButton>
            </Menu>
          </div>
        </div>
        {drawer}
        <WalletBalance fullOpen={fullOpen} />
      </Drawer>
    </nav>
  );
};

export default SideDrawer;
