import { useContext } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { SideDrawerContext } from 'context/session';
import GlificLogo from 'assets/images/logo/Logo.svg';
import { SideDrawer } from './Navigation/SideDrawer/SideDrawer';
import styles from './Layout.module.css';

export interface LayoutProps {
  children: any;
}

export const Layout = ({ children }: LayoutProps) => {
  const { setDrawerOpen } = useContext(SideDrawerContext);

  return (
    <>
      <SideDrawer />
      <main className={styles.MainFullWidth} data-testid="layout">
        <div className={styles.MobileHeader}>
          <img src={GlificLogo} className={styles.GlificLogo} alt="Glific" />
          <span
            aria-hidden
            data-testid="menu-icon"
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
