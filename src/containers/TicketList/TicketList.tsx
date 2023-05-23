import { useTranslation } from 'react-i18next';
import { ReactComponent as TriggerIcon } from 'assets/images/icons/Trigger/Union.svg';
import { DELETE_TRIGGER } from 'graphql/mutations/Trigger';
import { List } from 'containers/List/List';
import styles from './TicketList.module.css';
import { TICKET_COUNT_QUERY, TICKET_LIST_QUERY } from 'graphql/queries/Ticket';

const getBody = (body: any) => <div className={styles.Collection}>{body}</div>;
const getStatus = (status: any) => <div className={styles.Collection}>{status}</div>;
const getTopic = (topic: any) => <div className={styles.Collection}>{topic}</div>;

const getColumns = ({ body, remarks, status, topic }: any) => ({
  body: getBody(body),
  status: getStatus(status),
  topic: getTopic(topic),
});

const columnStyles = [styles.Name, styles.EndDate, styles.Collections, styles.Actions];
const triggerIcon = <TriggerIcon className={styles.Icon} />;

const queries = {
  countQuery: TICKET_COUNT_QUERY,
  filterItemsQuery: TICKET_LIST_QUERY,
  deleteItemQuery: DELETE_TRIGGER,
};

export const TicketList = () => {
  const { t } = useTranslation();

  const columnNames: any = [
    { name: 'body', label: t('Issue') },
    { name: 'topic', label: t('Topic') },
    { label: t('Collections') },
    { label: t('Actions') },
  ];

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const dialogMessage = t("You won't be able to use this trigger.");

  return (
    <List
      title="Tickets"
      listItem="tickets"
      listItemName="ticket"
      pageLink="ticket"
      button={{ show: false }}
      listIcon={triggerIcon}
      // dialogMessage={dialogMessage}
      {...queries}
      {...columnAttributes}
    />
  );
};

export default TicketList;
