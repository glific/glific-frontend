import React from 'react';

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
    <>
      {/* <Header MenuToggle={handleDrawerToggle} /> */}
      <SideDrawer MenuToggle={handleDrawerToggle} isMobile={mobileOpen} />
      <Content {...props} />
    </>
  );
};

export default Layout;
