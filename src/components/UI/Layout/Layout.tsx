import React from 'react';

import { SideDrawer } from './Navigation/SideDrawer/SideDrawer';
import styles from './Layout.module.css';

export interface LayoutProps {
  children: any;
}

export const Layout: React.SFC<LayoutProps> = (props) => {
  const { children } = props;
  return (
    <>
      <SideDrawer />
      <main className={styles.Main} data-testid="layout">
        <div>{children}</div>
      </main>
    </>
  );
};

export default Layout;
