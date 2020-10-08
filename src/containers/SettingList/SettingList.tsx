import React from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import Typography from '@material-ui/core/Typography/Typography';
import styles from './SettingList.module.css';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { GET_PROVIDERS } from '../../graphql/queries/Organization';
import { ReactComponent as Settingicon } from '../../assets/images/icons/Settings/Settings.svg';
import { ReactComponent as EditIcon } from '../../assets/images/icons/Edit.svg';
import { Card, CardContent, CardActions, IconButton } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { NOTIFICATION } from '../../graphql/queries/Notification';
import { setNotification } from '../../common/notification';
import { ToastMessage } from '../../components/UI/ToastMessage/ToastMessage';

const SettingIcon = <Settingicon />;

const List = [
  {
    name: 'Organisation',
    shortcode: 'organization',
    description: 'Manage organisation name, supported languages, hours of operations.',
  },
];

export const SettingList: React.SFC = () => {
  const message = useQuery(NOTIFICATION);
  let toastMessage: {} | null | undefined;
  const client = useApolloClient();

  const { data: providerData, loading } = useQuery(GET_PROVIDERS);

  if (loading) return <Loading />;

  let CardList: any = [];
  if (providerData) {
    //create setting list of Organisation & providers
    CardList = [...List, ...providerData.providers];
  }

  let heading = (
    <Typography variant="h5" className={styles.Title}>
      <IconButton disabled={true} className={styles.Icon}>
        {SettingIcon}
      </IconButton>
      Settings
    </Typography>
  );

  //toast
  const closeToastMessage = () => {
    setNotification(client, null);
  };

  if (message.data && message.data.message) {
    toastMessage = <ToastMessage message={message.data.message} handleClose={closeToastMessage} />;
  }

  return (
    <>
      {heading}
      {toastMessage}
      <div className={styles.CardContainer}>
        {CardList.map((data: any) => {
          return (
            <Card variant="outlined" className={styles.Card} key={data.shortcode}>
              <CardContent className={styles.CardContent}>
                <div data-testid="label" className={styles.Label}>
                  {data.name}
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
