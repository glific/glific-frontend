import React from 'react';

import { SideDrawer } from './Navigation/SideDrawer/SideDrawer';
import styles from './Layout.module.css';

export interface LayoutProps {}

export const Layout: React.SFC<LayoutProps> = (props) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <SideDrawer MenuToggle={handleDrawerToggle} isMobile={mobileOpen} />
      <main className={styles.Main}>
        <div>{props.children}</div>
      </main>
    </>
  );
};

export default Layout;
