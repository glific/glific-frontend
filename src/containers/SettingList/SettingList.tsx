import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Box, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

import { Loading } from 'components/UI/Layout/Loading/Loading';
import { GET_PROVIDERS } from 'graphql/queries/Organization';
import { Heading } from 'components/UI/Heading/Heading';
import Track from 'services/TrackService';
import styles from './SettingList.module.css';

export const SettingHeading = ({ formTitle, description }: any) => {
  return (
    <div className={styles.SettingHeader} data-testid="setting-header">
      <div>
        <div className={styles.SettingTitle}>{formTitle}</div>
        <div className={styles.SettingTextHeader}>{description}</div>
      </div>
    </div>
  );
};

export const SettingList = () => {
  const location = useLocation();

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: providerData, loading } = useQuery(GET_PROVIDERS);

  useEffect(() => {
    Track('Visit Settings');
  }, []);

  if (loading) return <Loading />;

  const list = [
    {
      name: 'Organization',
      shortcode: 'organization',
      description: t('Manage organization name, supported languages.'),
    },
    {
      name: 'Flows',
      shortcode: 'organization-flows',
      description: t('Manage organization flows.'),
    },
    {
      name: 'Billing',
      shortcode: 'billing',
      description: t('Setup for glific billing account'),
    },
  ];

  let providersList: any = [];
  if (providerData) {
    const providers = [...providerData.providers];
    const sortedProviders = providers.sort((first: any, second: any) =>
      first.name > second.name ? 1 : -1
    );

    // create setting list of Organisation & providers
    providersList = [...sortedProviders];
  }

  const drawer = (
    <div className={styles.Drawer} data-testid="setting-drawer">
      {list.map((data: any, index: number) => (
        <div
          key={index}
          onClick={() => navigate(`/settings/${data.shortcode}`)}
          className={`${styles.Tab} ${
            location.pathname == `/settings/${data.shortcode}` && styles.ActiveTab
          }`}
        >
          {data.name}
        </div>
      ))}
      <Divider className={styles.Divider} />
      {providersList.map((data: any, index: number) => (
        <div
          key={index}
          onClick={() => navigate(`/settings/${data.shortcode}`)}
          className={`${styles.Tab} ${
            location.pathname == `/settings/${data.shortcode}` && styles.ActiveTab
          }`}
        >
          {data.name}
        </div>
      ))}
    </div>
  );

  const completeList = [...list, ...providersList];

  const heading = completeList.find(
    (data: any) => data.shortcode === location.pathname.replace(/\/settings\//gi, '')
  );

  return (
    <>
      <Heading formTitle="Settings" />
      <Box className={styles.SettingsContainer}>
        {drawer}
        <Box className={styles.SettingBody}>
          <SettingHeading
            formTitle={heading ? heading.name : ''}
            description={heading ? heading.description : ''}
          />
          <Outlet />
        </Box>
      </Box>
    </>
  );
};

export default SettingList;
