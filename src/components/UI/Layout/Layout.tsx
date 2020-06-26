import React, { useState } from 'react';

import { SideDrawer } from './Navigation/SideDrawer/SideDrawer';
import styles from './Layout.module.css';

export interface LayoutProps {}

export const Layout: React.SFC<LayoutProps> = (props) => {
  return (
    <>
      <SideDrawer />
      <main className={styles.Main}>
        <div>{props.children}</div>
      </main>
    </>
  );
};

export default Layout;
