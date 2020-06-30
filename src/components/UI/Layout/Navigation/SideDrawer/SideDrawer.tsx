import React, { useState } from 'react';
import {
  Hidden,
  Drawer,
  makeStyles,
  createStyles,
  Theme,
  useTheme,
  Divider,
  Toolbar,
  Typography,
} from '@material-ui/core';
import clsx from 'clsx';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import SideMenus from '../SideMenus/SideMenus';
import * as constants from '../../../../../common/constants';

export interface SideDrawerProps {}

const drawerWidth = constants.SIDE_DRAWER_WIDTH;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: 36,
    },
    hide: {
      display: 'none',
    },
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
      // necessary for content to be below app bar
      // ...theme.mixins.toolbar,
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
  })
);

export const SideDrawer: React.SFC<SideDrawerProps> = (props) => {
  const classes = useStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fullOpen, setFullOpen] = React.useState(true);

  const drawer = (
    <div>
      <Toolbar className={classes.anotherToolBar}>
        {fullOpen ? (
          <div className={classes.outerBox}>
            <Typography variant="h6" className={classes.title}>
              Glific
            </Typography>
            <IconButton className={classes.iconButton} onClick={() => setFullOpen(false)}>
              <MenuIcon />
            </IconButton>
          </div>
        ) : (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setFullOpen(true)}
            // className={(classes.menuButton, clsx({ [classes.hide]: fullOpen }))}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <SideMenus />
    </div>
  );

  const container = window !== undefined ? () => window.document.body : undefined;

  return (
    <nav className={classes.drawer} aria-label="navigation menus">
      {/* <nav
      className={clsx({
        [classes.drawer]: fullOpen,
        [classes.navClose]: !fullOpen,
      })}
      aria-label="navigation menus"
    ></nav> */}
      {/* What is the purpose of this drawer? */}
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
          // classes={{
          //   paper: classes.drawerPaper,
          // }}
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
        </Drawer>
      </Hidden>
    </nav>
  );
};

export default SideDrawer;
