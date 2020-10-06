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
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import clsx from 'clsx';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SideMenus from '../SideMenus/SideMenus';
import styles from './SideDrawer.module.css';
import Menu from '../../../Menu/Menu';
import * as constants from '../../../../../common/constants';
import InactiveStaffIcon from '../../../../../assets/images/icons/StaffManagement/Inactive.svg';
import ActiveStaffIcon from '../../../../../assets/images/icons/StaffManagement/Active.svg';
import InactiveUserIcon from '../../../../../assets/images/icons/User/Inactive.png';
import ActiveUserIcon from '../../../../../assets/images/icons/User/Active.svg';
import ActiveIcon from '../../../../../assets/images/icons/Settings/Active.svg';
import InactiveIcon from '../../../../../assets/images/icons/Settings/Inactive.svg';
import GlificLogo from '../../../../../assets/images/logo/Logo.svg';
import { userAccountMenus } from '../../../../../config/menu';
import { Link, useLocation } from 'react-router-dom';
import {
  getStaffManagementMenus,
  settingMenu,
  getRoleBasedAccess,
} from '../../../../../context/role';
import { Tooltip } from '../../../Tooltip/Tooltip';

export interface SideDrawerProps {}

const drawerWidth = constants.SIDE_DRAWER_WIDTH;

const theme = createMuiTheme({
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
      zIndex: 0,
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
    navClose: {
      width: '72px',
    },
    drawerOpen: {
      width: drawerWidth,
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
      width: theme.spacing(7) + 1,
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
      bottom: '10px',
      display: 'flex',
      width: '100%',
      paddingLeft: '8px',
    },
  })
);

export const SideDrawer: React.SFC<SideDrawerProps> = (props) => {
  const location = useLocation();
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fullOpen, setFullOpen] = React.useState(true);
  const [active, setActive] = React.useState(false);
  const [staffManagementMenus, setStaffManagementMenus] = React.useState<any>([]);

  // get menu for role
  const getMenus = () => {
    setStaffManagementMenus(getStaffManagementMenus());
  };

  const drawer = (
    <div>
      <Toolbar className={classes.anotherToolBar}>
        {fullOpen ? (
          <div className={classes.outerBox}>
            <ThemeProvider theme={theme}>
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

  const handleClick = () => {
    setActive(!active);
  };

  // check access for settings on page reload
  if (!settingMenu) {
    getRoleBasedAccess();
  }

  const settingMenus = settingMenu ? (
    <div>
      <Tooltip title="Settings" placement="top" tooltipClass={styles.tooltipClass}>
        <Link to={'/settings'} onClick={handleClick}>
          <IconButton>
            <img
              src={location.pathname === '/settings' ? ActiveIcon : InactiveIcon}
              className={styles.UserIcon}
              alt="settings"
            />
          </IconButton>
        </Link>
      </Tooltip>
    </div>
  ) : null;

  return (
    <nav
      className={clsx({
        [classes.drawer]: fullOpen,
        [classes.navClose]: !fullOpen,
      })}
      aria-label="navigation menus"
    >
      <Hidden smUp implementation="css">
        <Drawer
          container={container}
          variant="temporary"
          anchor={theme.direction === 'rtl' ? 'right' : 'left'}
          open={mobileOpen}
          onClose={() => setMobileOpen(!mobileOpen)}
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
      <Hidden xsDown implementation="css">
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
          <div className={classes.BottomMenus}>
            {settingMenus}
            <div onClick={() => getMenus()}>
              <Menu menus={staffManagementMenus}>
                <Tooltip
                  title="Staff Management"
                  placement="top"
                  tooltipClass={styles.tooltipClass}
                >
                  <IconButton>
                    <img
                      src={
                        ['/group', '/staff-management', '/blocked-contacts'].includes(
                          location.pathname
                        )
                          ? ActiveStaffIcon
                          : InactiveStaffIcon
                      }
                      className={styles.StaffIcon}
                      alt="staff icon"
                    />
                  </IconButton>
                </Tooltip>
              </Menu>
            </div>
            <div>
              <Menu menus={userAccountMenus}>
                <Tooltip title="Profile" placement="top" tooltipClass={styles.tooltipClass}>
                  <IconButton>
                    <img
                      src={
                        location.pathname === '/user-profile' ? ActiveUserIcon : InactiveUserIcon
                      }
                      className={styles.UserIcon}
                      alt="user icon"
                    />
                  </IconButton>
                </Tooltip>
              </Menu>
            </div>
          </div>
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  );
};

export default SideDrawer;
