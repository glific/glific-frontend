import React from 'react';
import { Grid } from '@material-ui/core';

import { Header } from './Header/Header';
import { Content } from './Content/Content';
import { SideDrawer } from './Navigation/SideDrawer/SideDrawer';

export interface LayoutProps {}

export const Layout: React.SFC<LayoutProps> = (props) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Grid container direction="column">
      <Grid item>
        <Header MenuToggle={handleDrawerToggle} />
      </Grid>
      <Grid item container>
        <Grid item xs={false} sm={2}>
          <SideDrawer MenuToggle={handleDrawerToggle} isMobile={mobileOpen} />
        </Grid>
        <Grid item xs={12} sm={10}>
          <Content {...props} />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Layout;
