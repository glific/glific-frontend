import moment from 'moment';
import { useTranslation } from 'react-i18next';
import UserIcon from 'assets/images/icons/UserIcon.svg?react';
import { getAuthSession, getUserSession } from 'services/AuthService';
import { DATE_TIME_FORMAT, GUPSHUP_ENTERPRISE_SHORTCODE } from 'common/constants';

import styles from './LastLogin.module.css';
import { Divider, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import { useContext } from 'react';
import { ProviderContext } from 'context/session';

interface LastLoginProps {
  drawerOpen: boolean;
}

export const LastLogin = ({ drawerOpen }: LastLoginProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const userName = getUserSession('name');
  const lastLogin = getAuthSession('last_login_time');
  const { provider } = useContext(ProviderContext);
  const lastLoginStyle =
    provider === GUPSHUP_ENTERPRISE_SHORTCODE ? styles.LastLoginEnterprise : styles.LastLogin;
  return drawerOpen ? (
    <div
      className={styles.UserAccount}
      onClick={() =>
        navigate('/user-profile', { state: { subMenu: { active: true, value: '/user-profile' } } })
      }
    >
      <Divider />
      <div className={styles.User}>
        <UserIcon />
        <div>
          <Typography variant="body2"> {userName}</Typography>
          <div className={styles.LastLogin}>
            {t('Last login')}: {moment(lastLogin).format(DATE_TIME_FORMAT)}
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
