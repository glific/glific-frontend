import { embedDashboard } from '@superset-ui/embedded-sdk';
import axios from 'axios';
import { ANALYTICS_ENDPOINT, SUPERSET_DASHBOARD_ID } from 'config';
import setLogs from 'config/logs';
import { t } from 'i18next';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getAuthSession } from 'services/AuthService';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import styles from './Analytics.module.css';

export const Analytics: React.FC = () => {
  const [embedError, setEmbedError] = useState(false);
  const [loading, setLoading] = useState(true);
  const cachedToken = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const fetchEmbedToken = async () => {
    try {
      const response = await axios.post(
        ANALYTICS_ENDPOINT,
        {},
        {
          headers: {
            Authorization: getAuthSession('access_token'),
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      setLogs(error?.message ?? 'Embed token fetch failed', 'error', true);
      throw error;
    }
  };

  const fetchAndCacheToken = useCallback(async () => {
    const response = await fetchEmbedToken();
    cachedToken.current = response.token;
    return response.token;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await fetchAndCacheToken();
        setLoading(false);
        const mountHTMLElement: HTMLElement | null = document.getElementById('dashboard-container');
        if (mountHTMLElement && token) {
          embedDashboard({
            id: SUPERSET_DASHBOARD_ID,
            supersetDomain: 'https://moonshine.projecttech4dev.org',
            mountPoint: mountHTMLElement,
            fetchGuestToken: async () => {
              const cached = cachedToken.current;
              return cached ?? fetchAndCacheToken();
            },
            dashboardUiConfig: {
              hideTitle: true,
              hideChartControls: true,
              filters: {
                expanded: true,
              },
            },
          });
        }
        intervalRef.current = setInterval(fetchAndCacheToken, 4.5 * 60 * 1000);
      } catch {
        setLoading(false);
        setEmbedError(true);
      }
    })();

    return () => clearInterval(intervalRef.current);
  }, [fetchAndCacheToken]);

  if (embedError) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorTitle}>{t('Unable to load the analytics dashboard.')}</p>
        <p className={styles.errorBody}>
          {t('Please')}{' '}
          <button className={styles.refreshButton} onClick={() => window.location.reload()}>
            {t('refresh the page')}
          </button>{' '}
          {t('or')}{' '}
          <a className={styles.supportLink} href="mailto:support@glific.org">
            {t('contact support')}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      {loading && <Loading />}
      <div
        id="dashboard-container"
        className={styles.embeddedsuperset}
        style={loading ? { display: 'none' } : undefined}
      ></div>
    </>
  );
};

export default Analytics;
