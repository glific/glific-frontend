import { useContext, useState } from 'react';
import { Hidden, Drawer, Toolbar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SideDrawerContext, ProviderContext } from 'context/session';
import Menu from 'components/UI/Menu/Menu';
import { GUPSHUP_ENTERPRISE_SHORTCODE } from 'common/constants';
import InactiveStaffIcon from 'assets/images/icons/StaffManagement/Inactive.svg';
import ActiveStaffIcon from 'assets/images/icons/StaffManagement/Active.svg';
import InactiveUserIcon from 'assets/images/icons/User/Inactive.svg';
import ActiveUserIcon from 'assets/images/icons/User/Active.svg';
import ActiveIcon from 'assets/images/icons/Settings/Active.svg';
import InactiveIcon from 'assets/images/icons/Settings/Inactive.svg';
import GlificLogo from 'assets/images/logo/Logo.svg';
import { getUserRolePermissions, getUserAccountMenus, getStaffManagementMenus } from 'context/role';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';
import { WalletBalance } from 'containers/WalletBalance/WalletBalance';
import { LastLogin } from 'containers/LastLogin/LastLogin';
import { isGreaterThanLgBreakpoint } from 'common/utils';
import SideMenus from '../SideMenus/SideMenus';

import styles from './SideDrawer.module.css';

export const SideDrawer = () => {
  const location = useLocation();
  const { drawerOpen, setDrawerOpen } = useContext(SideDrawerContext);

  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  const { provider } = useContext(ProviderContext);

  const drawer = (
    <div>
      <Toolbar className={styles.AnotherToolBar}>
        {drawerOpen ? (
          <div className={styles.OuterBox}>
            <Typography variant="h6" className={styles.Title}>
              <img src={GlificLogo} className={styles.GlificLogo} alt="Glific" />
            </Typography>

            <IconButton
              className={styles.IconButton}
              onClick={() => setDrawerOpen(false)}
              data-testid="drawer-button"
            >
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
      <SideMenus opened={drawerOpen} />
    </div>
  );

  const container = window !== undefined ? () => window.document.body : undefined;

  let settingMenu;
  const userRolePermissions = getUserRolePermissions();
  if (userRolePermissions.accessSettings) {
    settingMenu = (
      <div>
        <Tooltip title={t('Settings')} placement="top">
          <Link to="/settings">
            <IconButton data-testid="settingsMenu">
              <img
                src={location.pathname === '/settings' ? ActiveIcon : InactiveIcon}
                className={styles.UserIcon}
                alt="settings"
              />
            </IconButton>
          </Link>
        </Tooltip>
      </div>
    );
  }

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
      onMouseOver={() => {
        if (!isGreaterThanLgBreakpoint()) setDrawerOpen(true);
      }}
      onMouseLeave={() => {
        if (!isGreaterThanLgBreakpoint()) setDrawerOpen(false);
      }}
      onFocus={() => {
        if (!isGreaterThanLgBreakpoint()) setDrawerOpen(true);
      }}
      className={drawerOpen && isGreaterThanLgBreakpoint() ? styles.Drawer : styles.NavClose}
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
        <div className={bottonMenuClasses.join(' ')}>
          {settingMenu}
          <div>
            <Menu
              menus={getStaffManagementMenus()}
              eventType="MouseEnter"
              placement={drawerOpen ? 'top' : 'right-end'}
            >
              <IconButton data-testid="staffManagementMenu">
                <img
                  src={
                    [
                      '/collection',
                      '/staff-management',
                      '/blocked-contacts',
                      '/consulting-hours',
                    ].includes(location.pathname)
                      ? ActiveStaffIcon
                      : InactiveStaffIcon
                  }
                  className={styles.StaffIcon}
                  alt="staff icon"
                />
              </IconButton>
            </Menu>
          </div>
          <div>
            <Menu
              menus={getUserAccountMenus()}
              eventType="MouseEnter"
              placement={drawerOpen ? 'top' : 'right-end'}
            >
              <IconButton data-testid="profileMenu">
                <img
                  src={location.pathname === '/user-profile' ? ActiveUserIcon : InactiveUserIcon}
                  className={styles.UserIcon}
                  alt="user icon"
                />
              </IconButton>
            </Menu>
          </div>
        </div>
        {drawer}
        <LastLogin drawerOpen={drawerOpen} />
        <WalletBalance fullOpen={drawerOpen} />
      </Drawer>
    </nav>
  );
};

export default SideDrawer;
