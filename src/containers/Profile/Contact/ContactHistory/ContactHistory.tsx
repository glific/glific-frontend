import { MessageChannel, STANDARD_DATE_TIME_FORMAT } from 'common/constants';
import { ChannelLabel } from 'components/UI/ChannelLabel/ChannelLabel';
import setLogs from 'config/logs';
import { List } from 'containers/List/List';
import dayjs from 'dayjs';
import { COUNT_CONTACT_HISTORY, GET_CONTACT_HISTORY } from 'graphql/queries/Contact';
import { useTranslation } from 'react-i18next';
import styles from './ContactHistory.module.css';

export interface ContactHistoryProps {
  contactId: string | undefined;
  profileId?: string | null;
}

export const ContactHistory = ({ contactId, profileId }: ContactHistoryProps) => {
  const { t } = useTranslation();

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
      setLogs(`Error parsing flowevents eventlabel: ${error}`, 'info', true);
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
      setLogs(`Error parsing contactFieldUpdate eventMeta: ${error}`, 'info', true);
    }
  };

  // Flow entries and the web channel's own entries say which channel they happened on. A flow entry
  // written before channels were recorded has none, which ChannelLabel reads as WhatsApp.
  const showsChannel = (eventType: string) => eventType.startsWith('contact_flow_') || eventType.startsWith('web_');

  const getEventLabel = (eventLabel: string, eventType: string, eventMeta: string, channel?: MessageChannel | null) => {
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
        <div className={styles.LineItem}>
          {label}
          {showsChannel(eventType) && <ChannelLabel channel={channel} variant="chip" testId="historyChannel" />}
        </div>
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
  const columnNames = [
    { name: 'event_label', label: t('Title') },
    { label: t('Date and Time'), name: 'inserted_at', sort: true, order: 'desc' },
  ];

  const getColumns = ({ eventLabel, eventType, insertedAt, eventMeta, channel }: any) => ({
    eventLabel: getEventLabel(eventLabel, eventType, eventMeta, channel),
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
      <List
        customStyles={styles.ListBody}
        title={t('Contact History')}
        listItem="contactHistory"
        listItemName="contactHistory"
        pageLink="history"
        listIcon={null}
        {...queries}
        {...columnAttributes}
        showActions={false}
        filters={{ contactId, profileId }}
        showHeader={false}
        restrictedAction={restrictedAction}
        button={{ show: false }}
      />
    </div>
  );
};
