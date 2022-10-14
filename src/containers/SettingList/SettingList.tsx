import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import Typography from '@material-ui/core/Typography/Typography';
import { Card, CardContent, CardActions, IconButton } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { Loading } from 'components/UI/Layout/Loading/Loading';
import { GET_PROVIDERS } from 'graphql/queries/Organization';
import { ReactComponent as Settingicon } from 'assets/images/icons/Settings/Settings.svg';
import { ReactComponent as EditIcon } from 'assets/images/icons/Edit.svg';
import styles from './SettingList.module.css';

export const SettingList = () => {
  const { t } = useTranslation();
  const { data: providerData, loading } = useQuery(GET_PROVIDERS);

  if (loading) return <Loading />;
  const SettingIcon = <Settingicon />;

  const List = [
    {
      name: 'Organisation',
      shortcode: 'organization',
      description: t('Manage organisation name, supported languages, hours of operations.'),
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
                <IconButton aria-label="Edit" color="default" data-testid="EditIcon">
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
