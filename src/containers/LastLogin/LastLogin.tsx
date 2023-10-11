import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { getAuthSession } from 'services/AuthService';
import { DATE_TIME_FORMAT } from 'common/constants';

import styles from './LastLogin.module.css';

interface LastLoginProps {
  drawerOpen: boolean;
}

export const LastLogin = ({ drawerOpen }: LastLoginProps) => {
  const { t } = useTranslation();
  const lastLogin = getAuthSession('last_login_time');
  return drawerOpen ? (
    <div className={styles.lastLogin}>
      {t('Last login')}: {moment(lastLogin).format(DATE_TIME_FORMAT)}
    </div>
  ) : null;
};
