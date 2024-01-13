import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { getOrganizationServices } from 'services/AuthService';
import { COUNT_CONTACT_HISTORY, GET_CONTACT_HISTORY } from 'graphql/queries/Contact';
import setLogs from 'config/logs';
import { List } from 'containers/List/List';
import { STANDARD_DATE_TIME_FORMAT } from 'common/constants';
import styles from './ContactHistory.module.css';

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

  const isContactProfileEnabled = getOrganizationServices('contactProfileEnabled');

  const contactHistoryVariables: any = {};

  if (isContactProfileEnabled && profileId) {
    contactHistoryVariables.profileId = profileId;
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

  const getEventLabel = (eventLabel: string, eventType: string, eventMeta: string) => {
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

    return (
      <div className={styles.DetailBlock} key={eventLabel}>
        <div className={styles.LineItem}>{label}</div>
      </div>
    );
  };

  const getInsertedAt = (insertedAt: string) => (
    <div className={styles.LineItemDate}>{dayjs(insertedAt).format(STANDARD_DATE_TIME_FORMAT)}</div>
  );

  const queries = {
    countQuery: COUNT_CONTACT_HISTORY,
    filterItemsQuery: GET_CONTACT_HISTORY,
    deleteItemQuery: null,
  };

  const columnStyles = [styles.Label, styles.DateAndTime];
  const columnNames = [{ name: 'event_label', label: t('Title') }, { label: t('Date and Time') }];

  const getColumns = ({ eventLabel, eventType, insertedAt, eventMeta }: any) => ({
    eventLabel: getEventLabel(eventLabel, eventType, eventMeta),
    insertedAt: getInsertedAt(insertedAt),
  });

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const restrictedAction = () => ({ delete: false, edit: false });
  return (
    <div className={styles.HistoryContainer} data-testid="ContactHistory">
      <div className={styles.Title}>{t('Contact History')}</div>
      <List
        title={t('Contact History')}
        listItem="contactHistory"
        listItemName="contactHistory"
        pageLink="history"
        listIcon={null}
        {...queries}
        {...columnAttributes}
        showActions={false}
        filters={{ contactId }}
        showHeader={false}
        restrictedAction={restrictedAction}
        button={{ show: false }}
      />
    </div>
  );
};
