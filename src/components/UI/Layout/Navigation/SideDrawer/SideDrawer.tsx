import { useContext, useState } from 'react';
import { Hidden, Drawer, Toolbar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { SideDrawerContext, ProviderContext } from 'context/session';
import { GUPSHUP_ENTERPRISE_SHORTCODE } from 'common/constants';
import GlificLogo from 'assets/images/logo/Logo.svg';
import { WalletBalance } from 'containers/WalletBalance/WalletBalance';
import { LastLogin } from 'containers/LastLogin/LastLogin';
import SideMenus from '../SideMenus/SideMenus';

import styles from './SideDrawer.module.css';

export const SideDrawer = () => {
  const { drawerOpen, setDrawerOpen } = useContext(SideDrawerContext);

  const [mobileOpen, setMobileOpen] = useState(false);

  const { provider } = useContext(ProviderContext);

  const drawer = (
    <div>
      <Toolbar className={styles.AnotherToolBar}>
        {drawerOpen ? (
          <div className={styles.OuterBox}>
            <Typography variant="h6" className={styles.Title}>
              <img src={GlificLogo} className={styles.GlificLogo} alt="Glific" />
            </Typography>

            <IconButton onClick={() => setDrawerOpen(false)} data-testid="drawer-button">
              <MenuIcon />
            </IconButton>
          </div>
        ) : (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            data-testid="drawer-button-closed"
            style={{ margin: 'auto' }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>
      <WalletBalance fullOpen={drawerOpen} />
      <SideMenus opened={drawerOpen} />
    </div>
  );

  const container = window !== undefined ? () => window.document.body : undefined;

  // set the appropriate styles to display bottom menus correctly
  const bottonMenuClasses = [styles.BottomMenus];
  if (provider === GUPSHUP_ENTERPRISE_SHORTCODE) {
    bottonMenuClasses.unshift(styles.BottomMenusWithoutWallet);
  }

  if (!drawerOpen) {
    bottonMenuClasses.unshift(styles.BottomMenusVertical);
  }

  const HiddenProps = {
    smUp: true,
    implementation: 'css' as 'css',
  };

  return (
    <nav
      className={drawerOpen ? styles.Drawer : styles.NavClose}
      aria-label="navigation menus"
      data-testid="navbar"
    >
      <Hidden {...HiddenProps}>
        <Drawer
          container={container}
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={() => {
            setMobileOpen(!mobileOpen);
          }}
          classes={{
            paper: styles.DrawerPaper,
          }}
          ModalProps={{
            keepMounted: true,
          }}
        >
          {drawer}
        </Drawer>
      </Hidden>
      <Drawer
        classes={{
          paper: drawerOpen ? styles.DrawerOpen : styles.DrawerClose,
        }}
        variant="permanent"
      >
        {drawer}
        <LastLogin drawerOpen={drawerOpen} />
      </Drawer>
    </nav>
  );
};

export default SideDrawer;
