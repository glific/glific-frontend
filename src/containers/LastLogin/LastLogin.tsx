import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { getAuthSession } from 'services/AuthService';
import { DATE_TIME_FORMAT, GUPSHUP_ENTERPRISE_SHORTCODE } from 'common/constants';

import styles from './LastLogin.module.css';
import { useContext } from 'react';
import { ProviderContext } from 'context/session';

interface LastLoginProps {
  drawerOpen: boolean;
}

export const LastLogin = ({ drawerOpen }: LastLoginProps) => {
  const { t } = useTranslation();
  const lastLogin = getAuthSession('last_login_time');
  const { provider } = useContext(ProviderContext);
  const lastLoginStyle =
    provider === GUPSHUP_ENTERPRISE_SHORTCODE ? styles.LastLoginEnterprise : styles.LastLogin;
  return drawerOpen ? (
    <div className={lastLoginStyle}>
      {t('Last login')}: {dayjs(lastLogin).format(DATE_TIME_FORMAT)}
    </div>
  ) : null;
};
