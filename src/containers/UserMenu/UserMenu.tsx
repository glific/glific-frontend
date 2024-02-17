import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import UserIcon from 'assets/images/icons/UserIcon.svg?react';
import { getAuthSession, getUserSession } from 'services/AuthService';
import relativeTime from 'dayjs/plugin/relativeTime';
import ExpandIcon from 'assets/images/icons/Expand.svg?react';
import { Divider, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import Menu from 'components/UI/Menu/Menu';
import ListIcon from 'components/UI/ListIcon/ListIcon';
import { getUserAccountMenus } from 'context/role';
import { slicedString } from 'common/utils';
import { useState } from 'react';
import styles from './UserMenu.module.css';
dayjs.extend(relativeTime);

interface UserMenuProps {
  drawerOpen: boolean;
}

export const UserMenu = ({ drawerOpen }: UserMenuProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const userName = getUserSession('name');
  const [open, setOpen] = useState(false);
  const UserMenu = getAuthSession('last_login_time');
  const menu = getUserAccountMenus();

  const menus = menu.map((menu) => ({
    title: t(menu.title as any),
    icon: <ListIcon icon={menu.icon} />,
    onClick: () => {
      navigate(menu.path);
    },
    className: styles.Settings,
  }));

  return (
    <div
      className={drawerOpen ? styles.UserAccount : styles.UserAccountClosed}
      data-testid="user-account"
    >
      <Divider />
      <Menu menus={menus} onOpen={() => setOpen(true)} onClose={() => setOpen(false)}>
        <div className={drawerOpen ? styles.UserOpen : styles.UserClosed}>
          <UserIcon />
          {drawerOpen && (
            <div>
              <Typography variant="body2">{slicedString(userName, 12)}</Typography>
              <div className={styles.UserMenu}>
                {t('Last login')}: {dayjs(UserMenu).fromNow()}
              </div>
            </div>
          )}

          <ExpandIcon
            className={`${styles.RotatableSvg} ${open ? styles.Rotate180 : styles.Rotate0}`}
          />
        </div>
      </Menu>
    </div>
  );
};
