import React from 'react';
import { Grid } from '@material-ui/core';

import { Header } from './Header/Header';
import { Content } from './Content/Content';

export interface LayoutProps {}

export const Layout: React.SFC<LayoutProps> = (props) => {
  return (
    <Grid container direction="column">
      <Grid item>
        <Header />
      </Grid>
      <Grid item container>
        <Grid item xs={false} sm={2} />
        <Grid item xs={12} sm={10}>
          <Content {...props} />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Layout;
