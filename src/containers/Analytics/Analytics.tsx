import { embedDashboard } from '@superset-ui/embedded-sdk';
import axios from 'axios';
import { ANALYTICS_ENDPOINT, SUPERSET_DASHBOARD_ID } from 'config';
import setLogs from 'config/logs';
import { t } from 'i18next';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getAuthSession } from 'services/AuthService';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { ErrorPage } from 'components/UI/ErrorPage/ErrorPage';
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
          await embedDashboard({
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
        intervalRef.current = setInterval(
          () => {
            fetchAndCacheToken().catch(() => {
              // failure already sent to Sentry in fetchEmbedToken
            });
          },
          4.5 * 60 * 1000
        );
      } catch {
        setLoading(false);
        setEmbedError(true);
      }
    })();

    return () => clearInterval(intervalRef.current);
  }, [fetchAndCacheToken]);

  if (embedError) {
    return <ErrorPage title={t('Unable to load the analytics dashboard.')} />;
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
