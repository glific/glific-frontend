import React, { useState } from 'react';

import { SideDrawer } from './Navigation/SideDrawer/SideDrawer';
import styles from './Layout.module.css';

export interface LayoutProps {
  children: any;
}

export const Layout: React.SFC<LayoutProps> = (props) => {
  const { children } = props;
  const [fullOpen, setFullOpen] = useState(true);
  let mainStyle = styles.Main;
  if (!fullOpen) {
    mainStyle = styles.MainFullWidth;
  }
  return (
    <>
      <SideDrawer fullOpen={fullOpen} setFullOpen={setFullOpen} />
      <main className={mainStyle} data-testid="layout">
        <div>{children}</div>
      </main>
    </>
  );
};

export default Layout;
