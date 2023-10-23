import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Card, CardContent, CardActions, IconButton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { GET_PROVIDERS } from 'graphql/queries/Organization';
import Settingicon from 'assets/images/icons/Settings/Settings.svg?react';
import EditIcon from 'assets/images/icons/Edit.svg?react';
import styles from './SettingList.module.css';
import { useEffect } from 'react';
import Track from 'services/TrackService';

export const SettingList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: providerData, loading } = useQuery(GET_PROVIDERS);
  useEffect(() => {
    Track('Visit Settings');
  }, []);

  if (loading) return <Loading />;
  const SettingIcon = <Settingicon />;

  const List = [
    {
      name: 'Organisation',
      shortcode: 'organization',
      description: t('Manage organisation name, supported languages.'),
    },
    {
      name: 'Flows',
      shortcode: 'organization-flows',
      description: t('Manage organisation flows.'),
    },
    {
      name: 'Billing',
      shortcode: 'billing',
      description: t('Setup for glific billing account'),
    },
  ];

  const heading = (
    <Typography variant="h5" className={styles.Title}>
      <IconButton disabled className={styles.Icon}>
        {SettingIcon}
      </IconButton>
      {t('Settings')}
    </Typography>
  );

  let CardList: any = [];
  if (providerData) {
    // create setting list of Organisation & providers
    CardList = [...List, ...providerData.providers];
  }

  return (
    <>
      {heading}
      <div className={styles.CardContainer}>
        {CardList.map((data: any) => (
          <Card
            variant="outlined"
            className={styles.Card}
            key={data.shortcode}
            data-testid={data.shortcode}
            onClick={() => navigate(`/settings/${data.shortcode}`)}
          >
            <CardContent className={styles.CardContent}>
              <div data-testid="label" className={styles.Label}>
                {data.name}
              </div>
              <Typography
                variant="body2"
                component="div"
                data-testid="description"
                className={styles.Description}
              >
                {data.description}
              </Typography>
            </CardContent>
            <CardActions className={styles.CardActions}>
              <Link
                to={{
                  pathname: `/settings/${data.shortcode}`,
                }}
                className={styles.Link}
              >
                <IconButton aria-label="Edit" data-testid="EditIcon">
                  <EditIcon />
                </IconButton>
              </Link>
            </CardActions>
          </Card>
        ))}
      </div>
    </>
  );
};

export default SettingList;
