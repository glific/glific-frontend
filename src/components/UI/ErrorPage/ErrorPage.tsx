import { t } from 'i18next';
import GlificErrorIcon from 'assets/images/GlificError.svg?react';
import { Button } from 'components/UI/Form/Button/Button';
import styles from './ErrorPage.module.css';

interface ErrorPageProps {
  title: string;
  onRefresh?: () => void;
}

export function ErrorPage({ title, onRefresh }: ErrorPageProps) {
  const handleRefresh = onRefresh ?? (() => window.location.reload());

  return (
    <div className={styles.container}>
      <GlificErrorIcon className={styles.icon} aria-hidden="true" />
      <p className={styles.title}>{title}</p>
      <p className={styles.subtitle}>{t('Click refresh to try again or contact our support team for help')}</p>
      <Button variant="outlined" color="primary" onClick={handleRefresh}>
        {t('Refresh')}
      </Button>
    </div>
  );
}
