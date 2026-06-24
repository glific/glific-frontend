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
      <p className={styles.description}>
        {t('Please')}{' '}
        <button className={styles.inlineButton} onClick={handleRefresh}>
          {t('refresh to try again')}
        </button>{' '}
        {t('or')}{' '}
        <a className={styles.link} href="mailto:support@glific.org">
          {t('reach out to the support team')}
        </a>
        .
      </p>
      <Button variant="outlined" color="primary" onClick={handleRefresh}>
        {t('Refresh')}
      </Button>
    </div>
  );
}
