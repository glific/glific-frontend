import { embedDashboard } from '@superset-ui/embedded-sdk';
import axios from 'axios';
import { ANALYTICS_ENDPOINT } from 'config';
import React, { useEffect } from 'react';
import { getAuthSession } from 'services/AuthService';
import styles from './Analytics.module.css';
import { SUPERSET_DASHBOARD_ID } from 'config';

export const Analytics: React.FC = () => {
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
      throw error;
    }
  };

  useEffect(() => {
    (async () => {
      const response = await fetchEmbedToken();
      const embed_token = response.token;
      console.log(embed_token);
      const mountHTMLElement: HTMLElement | null = document.getElementById('dashboard-container');
      if (mountHTMLElement && embed_token) {
        embedDashboard({
          id: SUPERSET_DASHBOARD_ID,
          supersetDomain: 'https://kaapi.projecttech4dev.org',
          mountPoint: mountHTMLElement,
          fetchGuestToken: () => embed_token,
          dashboardUiConfig: {
            // dashboard UI config: hideTitle, hideTab, hideChartControls, filters.visible, filters.expanded (optional)
            hideTitle: true,
            hideChartControls: true,
            filters: {
              expanded: true,
            },
          },
        });
      }
    })();
  }, []);
  return <div id="dashboard-container" className={styles.embeddedsuperset}></div>;
};

export default Analytics;
