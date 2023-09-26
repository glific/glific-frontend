import { useQuery } from '@apollo/client';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { getOrganizationServices } from 'services/AuthService';
import { Button } from 'components/UI/Form/Button/Button';
import Loading from 'components/UI/Layout/Loading/Loading';
import { COUNT_CONTACT_HISTORY, GET_CONTACT_HISTORY } from 'graphql/queries/Contact';
import setLogs from 'config/logs';
import { DATE_TIME_FORMAT } from 'common/constants';
import styles from './ContactHistory.module.css';
import Pager from 'components/UI/Pager/Pager';
import { useState } from 'react';
import { getUpdatedList, setListSession, getLastListSessionValues } from 'services/ListService';

export interface ContactHistoryProps {
  contactId: string | undefined;
  profileId?: string | null;
}
interface TableVals {
  pageNum: number;
  pageRows: number;
  sortCol: string;
  sortDirection: 'asc' | 'desc';
}

export const ContactHistory = ({ contactId, profileId }: ContactHistoryProps) => {
  const { t } = useTranslation();

  const columnStyles = [styles.Label, styles.DateAndTime];
  const columnNames = [{ name: 'label', label: t('Title') }, { label: t('Date and Time') }];

  const getDefaultSortColumn = (columnsFields: any) => {
    const sortColumn = columnsFields.find((field: any) => (field.sort ? field : ''));
    if (sortColumn) {
      return [sortColumn.name, sortColumn.order];
    }

    return [columnNames[0].name, 'asc'];
  };

  const [defaultColumnSort, defaultColumnSortOrder] = getDefaultSortColumn(columnNames);

  const getSortColumn = (listItemNameValue: string) => {
    let columnnNameValue = defaultColumnSort;

    const sortValue = getLastListSessionValues(listItemNameValue, false);

    if (sortValue) {
      columnnNameValue = sortValue;
    }

    return columnnNameValue;
  };

  const getSortDirection = (listItemNameValue: string) => {
    let sortDirection = defaultColumnSortOrder;

    const sortValue = getLastListSessionValues(listItemNameValue, true);
    if (sortValue) {
      sortDirection = sortValue;
    }

    return sortDirection;
  };

  // Table attributes
  const [tableVals, setTableVals] = useState<TableVals>({
    pageNum: 0,
    pageRows: 5,
    sortCol: getSortColumn('Contact Profile'),
    sortDirection: getSortDirection('Contact Profile'),
  });

  const isContactProfileEnabled = getOrganizationServices('contactProfileEnabled');

  const { data: countHistory, loading: countHistoryLoading } = useQuery(COUNT_CONTACT_HISTORY, {
    fetchPolicy: 'network-only',
    variables: {
      filter: {
        contactId,
      },
    },
  });

  const contactHistoryVariables: any = {
    filter: {
      contactId,
    },
    opts: {
      limit: 10,
      offset: 0,
      order: 'DESC',
    },
  };

  if (isContactProfileEnabled && profileId) {
    contactHistoryVariables.filter.profileId = profileId;
  }
  const { data, loading, fetchMore } = useQuery(GET_CONTACT_HISTORY, {
    fetchPolicy: 'network-only',
    variables: contactHistoryVariables,
  });

  var tableData;

  function formatDate(inputDate: string): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    };

    const date = new Date(inputDate);
    return date.toLocaleDateString('en-US', options).replace(/ at/g, ',');
  }

  if (data) {
    tableData = data.contactHistory.map(
      ({ eventLabel, eventDatetime }: { eventLabel: string; eventDatetime: string }) => ({
        eventLabel,
        eventDatetime: formatDate(eventDatetime),
      })
    );
  }

  if (!data || loading) {
    return <Loading />;
  }

  if (!countHistory || countHistoryLoading) {
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

  const contactFieldUpdate = (eventMeta: string) => {
    try {
      const eventMetaObject = JSON.parse(eventMeta);
      return (
        <div>
          {eventMetaObject.field.label} is updated to {eventMetaObject.field.new_value} from{' '}
          {eventMetaObject.field.old_value ? eventMetaObject.field.old_value.value : ' empty'}
        </div>
      );
    } catch (error) {
      setLogs(error, 'error');
    }
    return null;
  };

  const handleTableChange = (attribute: string, newVal: any) => {
    const isSortAttribute = attribute === 'sortCol' || attribute === 'sortDirection';
    if (isSortAttribute) {
      const updatedList = getUpdatedList('Contact Profile', newVal, attribute === 'sortDirection');
      setListSession(JSON.stringify(updatedList));
    }

    setTableVals({
      ...tableVals,
      [attribute]: newVal,
    });
  };

  console.log('data.contactHistory}', data.contactHistory);
  const listList = (
    <Pager
      columnStyles={columnStyles}
      columnNames={columnNames}
      data={tableData}
      totalRows={tableData ? tableData.length : 0}
      handleTableChange={handleTableChange}
      tableVals={tableVals}
      collapseOpen={false}
      collapseRow={undefined}
    />
  );

  // console.log('data.contactHistory', typeof data.contactHistory);

  let items = data.contactHistory.map(({ eventLabel, eventType, insertedAt, eventMeta }: any) => {
    let label;
    switch (eventType) {
      case 'contact_flow_started':
        label = flowEvents(eventLabel, eventMeta);
        break;
      case 'contact_flow_ended':
        label = flowEvents(eventLabel, eventMeta);
        break;
      case 'contact_fields_updated':
        label = contactFieldUpdate(eventMeta);
        break;
      default:
        label = eventLabel;
    }

    const key = `${insertedAt}-${Math.random()}`;
    return (
      <div className={styles.DetailBlock} key={key}>
        <div className={styles.LineItem}>{label}</div>
        <div className={styles.LineItemDate}>{moment(insertedAt).format(DATE_TIME_FORMAT)}</div>
      </div>
    );
  });

  if (!items.length) {
    items = <div>{t('No history')}</div>;
  }

  return (
    <div className={styles.HistoryContainer} data-testid="ContactHistory">
      <div className={styles.Title}>{t('Contact History')}</div>
      {listList}
      {showMoreButton}
    </div>
  );
};
