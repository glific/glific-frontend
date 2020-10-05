import React from 'react';
import { useQuery } from '@apollo/client';
import Typography from '@material-ui/core/Typography/Typography';
import styles from './SettingList.module.css';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { GET_PROVIDERS } from '../../graphql/queries/Organization';
import { ReactComponent as Settingicon } from '../../assets/images/icons/Settings/Settings.svg';
import { ReactComponent as EditIcon } from '../../assets/images/icons/Edit.svg';
import { Card, CardContent, CardActions, IconButton } from '@material-ui/core';
import { Link } from 'react-router-dom';

const SettingIcon = <Settingicon />;

let CardList = [
  {
    label: 'Organisation',
    shortcode: 'organization',
    description: 'Manage organisation name, supported languages, hours of operations.',
  },
];

export const SettingList: React.SFC = () => {
  const { data: providerData } = useQuery(GET_PROVIDERS);

  if (!providerData) return <Loading />;

  if (providerData) {
    providerData.providers.map((provider: any) => {
      //create list
      if (CardList.filter((list: any) => list.label === provider.name).length <= 0)
        CardList.push({ label: provider.name, shortcode: provider.shortcode, description: '' });
    });
  }

  let heading = (
    <Typography variant="h5" className={styles.Title}>
      <IconButton disabled={true} className={styles.Icon}>
        {SettingIcon}
      </IconButton>
      Settings
    </Typography>
  );

  return (
    <>
      {heading}
      <div className={styles.CardContainer}>
        {CardList.map((data: any) => {
          return (
            <Card variant="outlined" className={styles.Card} key={data.shortcode}>
              <CardContent className={styles.CardContent}>
                <div data-testid="label" className={styles.Label}>
                  {data.label}
                </div>
                <Typography variant="body2" component="div" data-testid="description">
                  {data.description}
                </Typography>
              </CardContent>
              <CardActions className={styles.CardActions}>
                <Link
                  to={{
                    pathname: 'settings/' + data.shortcode,
                  }}
                  className={styles.Link}
                >
                  <IconButton aria-label="Edit" color="default" data-testid="EditIcon">
                    <EditIcon />
                  </IconButton>
                </Link>
              </CardActions>
            </Card>
          );
        })}
      </div>
    </>
  );
};
