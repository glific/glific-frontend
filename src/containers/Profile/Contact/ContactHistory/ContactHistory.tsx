import React from 'react';
import { useQuery } from '@apollo/client';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { Button } from 'components/UI/Form/Button/Button';
import Loading from 'components/UI/Layout/Loading/Loading';
import { COUNT_CONTACT_HISTORY, GET_CONTACT_HISTORY } from 'graphql/queries/Contact';
import setLogs from 'config/logs';
import styles from './ContactHistory.module.css';

export interface ContactHistoryProps {
  contactId: string;
}

export const ContactHistory: React.FC<ContactHistoryProps> = ({ contactId }) => {
  const { t } = useTranslation();

  const { data: countHistory, loading: countHistoryLoading } = useQuery(COUNT_CONTACT_HISTORY, {
    variables: {
      filter: {
        contactId,
      },
    },
  });
  const { data, loading, fetchMore } = useQuery(GET_CONTACT_HISTORY, {
    notifyOnNetworkStatusChange: true,
    variables: {
      filter: {
        contactId,
      },
      opts: {
        limit: 10,
        offset: 0,
        order: 'DESC',
      },
    },
  });

  if (!data && loading) {
    return <Loading />;
  }

  if (!countHistory && countHistoryLoading) {
    return <Loading />;
  }

  let showMoreButton;

  if (data.contactHistory.length !== countHistory.countContactHistory) {
    showMoreButton = (
      <div className={styles.Button}>
        <Button
          loading={loading}
          variant="outlined"
          color="primary"
          onClick={() => {
            fetchMore({
              variables: {
                opts: {
                  limit: 10,
                  offset: data.contactHistory.length,
                  order: 'DESC',
                },
              },
            });
          }}
        >
          Show more
        </Button>
      </div>
    );
  }

  const flowEvents = (eventLabel: string, eventMeta: string) => {
    try {
      const eventMetaObject = JSON.parse(eventMeta);
      return (
        <div>
          <span>{eventLabel}: </span>
          <a
            href={`/flow/configure/${eventMetaObject.flow.uuid}`}
            className={styles.Link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{eventMetaObject.flow.name}</span>
          </a>
        </div>
      );
    } catch (error) {
      setLogs(error, 'error');
    }
    return null;
  };

  let items = data.contactHistory.map(({ eventLabel, eventType, insertedAt, eventMeta }: any) => {
    let label;
    switch (eventType) {
      case 'contact_flow_started':
        label = flowEvents(eventLabel, eventMeta);
        break;
      default:
        label = eventLabel;
    }
    return (
      <div className={styles.DetailBlock} key={insertedAt}>
        <div className={styles.LineItem}>{label}</div>
        <div className={styles.LineItemDate}>{moment(insertedAt).format('D/MM/YYYY')}</div>
      </div>
    );
  });

  if (!items.length) {
    items = <div>{t('No history')}</div>;
  }

  return (
    <div className={styles.HistoryContainer} data-testid="ContactHistory">
      <h2 className={styles.Title}>{t('Contact History')}</h2>
      {items}
      {showMoreButton}
    </div>
  );
};
