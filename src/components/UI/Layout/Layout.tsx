import { useContext } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { SideDrawerContext } from 'context/session';
import GlificLogo from 'assets/images/logo/Logo.svg';
import { getAuthSession } from 'services/AuthService';
import TrialVideoModal from 'components/UI/TrialVideoModal/TrialVideoModal';
import { SideDrawer } from './Navigation/SideDrawer/SideDrawer';
import styles from './Layout.module.css';

export interface LayoutProps {
  children: any;
}

export const Layout = ({ children }: LayoutProps) => {
  const { setDrawerOpen } = useContext(SideDrawerContext);

  const trialSessionData = {
    last_login_time: getAuthSession('last_login_time'),
    is_trial: getAuthSession('is_trial'),
    trial_expiration_date: getAuthSession('trial_expiration_date'),
  };

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
      <TrialVideoModal sessionData={trialSessionData} />
    </>
  );
};

export default Layout;
