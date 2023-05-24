import { useTranslation } from 'react-i18next';
import { ReactComponent as TriggerIcon } from 'assets/images/icons/Trigger/Union.svg';
import { DELETE_TRIGGER } from 'graphql/mutations/Trigger';
import { List } from 'containers/List/List';
import styles from './TicketList.module.css';
import { ReactComponent as EditIcon } from 'assets/images/icons/Edit.svg';
import { TICKET_COUNT_QUERY, TICKET_LIST_QUERY } from 'graphql/queries/Ticket';

const getBody = (body: any) => <div className={styles.Collection}>{body}</div>;
const getStatus = (status: any) => <div className={styles.Collection}>{status}</div>;
const getTopic = (topic: any) => <div className={styles.Collection}>{topic}</div>;
const getUser = (user: any) => <div className={styles.Collection}>{user?.name}</div>;

const getColumns = ({ body, remarks, status, topic, user }: any) => ({
  body: getBody(body),
  topic: getTopic(topic),
  status: getStatus(status),
  user: getUser(user),
});

const columnStyles = [
  styles.Name,
  styles.EndDate,
  styles.Collections,
  styles.Collections,
  styles.Actions,
];
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
    { name: 'topic', label: t('Label') },
    { label: t('Status') },
    { label: t('Assigned to') },
    { label: t('Actions') },
  ];

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const getRestrictedAction = () => {
    return { edit: false, delete: false };
  };

  const additionalAction = () => [
    {
      icon: <EditIcon />,
      parameter: 'id',
      dialog: () => {},
      label: t('Add remark'),
    },
  ];

  return (
    <List
      restrictedAction={getRestrictedAction}
      title="Tickets"
      listItem="tickets"
      listItemName="ticket"
      pageLink="ticket"
      button={{ show: false }}
      listIcon={triggerIcon}
      // dialogMessage={dialogMessage}
      {...queries}
      {...columnAttributes}
      additionalAction={additionalAction}
    />
  );
};

export default TicketList;
