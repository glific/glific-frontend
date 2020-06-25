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
      <SideDrawer MenuToggle={handleDrawerToggle} isMobile={mobileOpen} />
      <main>
        <div>{props.children}</div>
      </main>
    </>
  );
};

export default Layout;
