import React, { useState, useContext } from 'react';
import {
  Hidden,
  Drawer,
  makeStyles,
  createStyles,
  Fade,
  Paper,
  Button,
  Theme,
  Divider,
  Toolbar,
  Typography,
  Popper,
} from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import axios from 'axios';
import clsx from 'clsx';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SideMenus from '../SideMenus/SideMenus';
import * as constants from '../../../../../common/constants';
import { SessionContext } from '../../../../../context/session';
import StaffIcon from '../../../../../assets/images/icons/StaffManagement/Inactive.svg';
import UserIcon from '../../../../../assets/images/icons/User.png';
import styles from './SideDrawer.module.css';
import { Redirect } from 'react-router-dom';

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
    LogoutButton: {
      position: 'absolute',
      bottom: '10px',
      left: '8px',
      width: 'fit-content',
    },
  })
);

export const SideDrawer: React.SFC<SideDrawerProps> = (props) => {
  const { setAuthenticated } = useContext(SessionContext);
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [fullOpen, setFullOpen] = React.useState(true);
  const [staffRedirect, setStaffRedirect] = React.useState(false);

  const drawer = (
    <div>
      <Toolbar className={classes.anotherToolBar}>
        {fullOpen ? (
          <div className={classes.outerBox}>
            <ThemeProvider theme={theme}>
              <Typography variant="h6" className={classes.title}>
                Glific
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
      <Divider />
      <SideMenus opened={fullOpen} />
    </div>
  );

  const popper = (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="right-end"
      transition
      className={styles.Popper}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Paper elevation={3}>
            <Button color="primary">My Account</Button>
            <br />
            <Button className={styles.LogoutButton} color="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </Paper>
        </Fade>
      )}
    </Popper>
  );

  const handleClick = (event: any) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleStaffClick = (event: any) => {
    setStaffRedirect(true);
  };

  const container = window !== undefined ? () => window.document.body : undefined;

  const session = localStorage.getItem('session');
  const accessToken = session ? JSON.parse(session).access_token : null;

  const handleLogout = () => {
    axios
      .delete(constants.USER_SESSION, {
        headers: {
          Authorization: accessToken,
        },
      })
      .then((response: any) => {
        localStorage.removeItem('session');
        setAuthenticated(false);
      })
      .catch(function (error: any) {
        console.log(error);
      });
  };

  if (staffRedirect) {
    return (
      <Redirect
        to={{
          pathname: '/staff-management',
        }}
      />
    );
  }

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
      {/* Rendered */}
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
          // open
        >
          {drawer}
          <IconButton className={classes.LogoutButton} onClick={handleClick}>
            <img src={UserIcon} className={styles.UserIcon} alt="user icon" />
          </IconButton>
          {popper}
          <IconButton className={classes.LogoutButton} onClick={handleStaffClick}>
            <img src={StaffIcon} className={styles.StaffIcon} alt="stafficon" />
          </IconButton>
        </Drawer>
      </Hidden>
    </nav>
  );
};

export default SideDrawer;
