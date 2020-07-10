import React, { useState } from 'react';
import {
  Hidden,
  Drawer,
  makeStyles,
  createStyles,
  Theme,
  Divider,
  Toolbar,
  Typography,
  Button,
} from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import clsx from 'clsx';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SideMenus from '../SideMenus/SideMenus';
import * as constants from '../../../../../common/constants';
import { useCookies } from 'react-cookie';

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
      left: '20px',
      width: 'fit-content',
    },
  })
);

export const SideDrawer: React.SFC<SideDrawerProps> = (props) => {
  const classes = useStyles();
  const [, , removeCookie] = useCookies(['session']);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fullOpen, setFullOpen] = React.useState(true);

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
            <IconButton className={classes.iconButton} onClick={() => setFullOpen(false)}>
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

  const container = window !== undefined ? () => window.document.body : undefined;

  const handleLogout = () => {
    removeCookie('session');
  };

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
          <Button
            color="secondary"
            variant="contained"
            className={classes.LogoutButton}
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </Drawer>
      </Hidden>
    </nav>
  );
};

export default SideDrawer;
