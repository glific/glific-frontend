import React, { useContext } from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import { SideDrawerContext } from 'context/session';
import GlificLogo from 'assets/images/logo/Logo.svg';
import { SideDrawer } from './Navigation/SideDrawer/SideDrawer';
import styles from './Layout.module.css';

export interface LayoutProps {
  children: any;
}

export const Layout = ({ children }: LayoutProps) => {
  const { drawerOpen, setDrawerOpen } = useContext(SideDrawerContext);
  let mainStyle = styles.Main;
  if (!drawerOpen) {
    mainStyle = styles.MainFullWidth;
  }
  return (
    <>
      <SideDrawer />
      <main className={mainStyle} data-testid="layout">
        <div className={styles.MobileHeader}>
          <img src={GlificLogo} className={styles.GlificLogo} alt="Glific" />
          <span
            aria-hidden
            className={styles.MenuIcon}
            onClick={() => {
              setDrawerOpen(true);
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
