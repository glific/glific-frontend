import React from 'react';
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

import SideMenus from '../SideMenus/SideMenus';
import * as constants from '../../../../../common/constants';

export interface SideDrawerProps {
  MenuToggle: () => void;
  isMobile: boolean;
}

const drawerWidth = constants.SIDE_DRAWER_WIDTH;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      [theme.breakpoints.up('sm')]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    drawerPaper: {
      width: drawerWidth,
    },
  })
);

export const SideDrawer: React.SFC<SideDrawerProps> = (props) => {
  const classes = useStyles();
  const theme = useTheme();

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6">Glific</Typography>
      </Toolbar>
      <Divider />
      <SideMenus />
    </div>
  );

  const container = window !== undefined ? () => window.document.body : undefined;

  return (
    <nav className={classes.drawer} aria-label="navigation menus">
      <Hidden smUp implementation="css">
        <Drawer
          container={container}
          variant="temporary"
          anchor={theme.direction === 'rtl' ? 'right' : 'left'}
          open={props.isMobile}
          onClose={props.MenuToggle}
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
          classes={{
            paper: classes.drawerPaper,
          }}
          variant="permanent"
          open
        >
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  );
};

export default SideDrawer;
