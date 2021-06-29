import React, { useState } from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import { SideDrawer } from './Navigation/SideDrawer/SideDrawer';
import styles from './Layout.module.css';
import GlificLogo from '../../../assets/images/logo/Logo.svg';

export interface LayoutProps {
  children: any;
}

export const Layout: React.SFC<LayoutProps> = (props) => {
  const { children } = props;
  const [fullOpen, setFullOpen] = useState(window.screen.width > 768);
  let mainStyle = styles.Main;
  if (!fullOpen) {
    mainStyle = styles.MainFullWidth;
  }
  return (
    <>
      <SideDrawer fullOpen={fullOpen} setFullOpen={setFullOpen} />
      <main className={mainStyle} data-testid="layout">
        <div className={styles.MobileHeader}>
          <img src={GlificLogo} className={styles.GlificLogo} alt="Glific" />
          <span
            aria-hidden
            className={styles.MenuIcon}
            onClick={() => {
              setFullOpen(true);
            }}
          >
            <MenuIcon />
          </span>
        </div>
        <div>{children}</div>
      </main>
    </>
  );
};

export default Layout;
