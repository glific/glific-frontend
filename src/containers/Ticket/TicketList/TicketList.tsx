import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { SupportAgent } from '@mui/icons-material';
import moment from 'moment';

import EditIcon from 'assets/images/icons/Edit.svg?react';
import ExportIcon from 'assets/images/icons/Flow/Export.svg?react';
import ChatIcon from 'assets/images/icons/Chat/UnselectedDark.svg?react';
import { DELETE_TRIGGER } from 'graphql/mutations/Trigger';
import { TICKET_COUNT_QUERY, TICKET_LIST_QUERY } from 'graphql/queries/Ticket';
import { List } from 'containers/List/List';
import { Button } from 'components/UI/Form/Button/Button';
import { ExportTicket } from './ExportTicket/ExportTicket';
import Ticket from 'containers/Ticket/Ticket';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import { getUserSession } from 'services/AuthService';
import styles from './TicketList.module.css';
import { BulkAction } from './BulkAction/BulkAction';

const getId = (id: any) => <div className={styles.TableText}>{id}</div>;
const getBody = (body: any) => <div className={styles.TableText}>{body}</div>;
const getTopic = (topic: any) => <div className={styles.TableText}>{topic}</div>;

const getInsertedAt = (insertedAt: string) => (
  <div className={styles.TableText}>{moment(insertedAt).format('DD-MM-YYYY hh:mm')}</div>
);

const getUser = (user: any) => <div className={styles.TableText}>{user?.name}</div>;

const getColumns = ({ id, body, status, insertedAt, user, contact, topic }: any) => ({
  ticketId: getId(id),
  insertedAt: getInsertedAt(insertedAt),
  body: getBody(body),
  topic: getTopic(topic),
  contact: getUser(contact),
  user: getUser(user),
});

const columnStyles = [
  styles.Id,
  styles.Created,
  styles.Label,
  styles.Issue,
  styles.Status,
  styles.Assigned,
  styles.Actions,
];
const ticketIcon = <SupportAgent className={styles.Icon} />;

const queries = {
  countQuery: TICKET_COUNT_QUERY,
  filterItemsQuery: TICKET_LIST_QUERY,
  deleteItemQuery: DELETE_TRIGGER,
};

const filterList = [
  { label: 'All', value: false },
  { label: 'My tickets', value: true },
];

export const TicketList = () => {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showBulkClose, setShowBulkClose] = useState(false);
  const { t } = useTranslation();
  const userId = getUserSession('id');

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState('');
  const [assignedToUser, setAssignedToUser] = useState<any>(false);
  const [status, setStatus] = useState<any>('open');

  let dialog;

  if (openDialog) {
    dialog = (
      <Dialog
        open
        classes={{
          paper: styles.Dialogbox,
        }}
      >
        <DialogContent classes={{ root: styles.DialogContent }}>
          <Ticket selectedTicket={selectedTicket} setOpenDialog={setOpenDialog}></Ticket>
        </DialogContent>
      </Dialog>
    );
  }

  if (showExportDialog) {
    dialog = <ExportTicket setShowExportDialog={setShowExportDialog} />;
  }

  if (showBulkClose) {
    dialog = <BulkAction setShowBulkClose={setShowBulkClose} />;
  }

  const columnNames: any = [
    { name: 'id', label: t('ID') },
    { name: 'inserted_at', label: t('Created at'), sort: true, order: 'desc' },
    { name: 'body', label: t('Issue') },
    { label: t('Topic') },
    { label: t('Opened by') },
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
    { icon: <ChatIcon />, parameter: 'contact.id', link: '/chat', label: t('Send Message') },
    {
      icon: <EditIcon />,
      parameter: 'id',
      dialog: (id: any) => {
        setSelectedTicket(id);
        setOpenDialog(true);
      },
      label: t('Add remark'),
    },
  ];

  const activeFilter = (
    <div className={styles.Filters}>
      <RadioGroup
        aria-label="ticket-type"
        name="ticket-type"
        row
        value={assignedToUser}
        onChange={(event) => {
          const { value } = event.target;
          setAssignedToUser(JSON.parse(value));
        }}
      >
        {filterList.map((filter) => (
          <div className={styles.RadioLabelWrapper} key={filter.label}>
            <FormControlLabel
              value={filter.value}
              control={<Radio color="primary" />}
              classes={{ root: styles.RadioLabel }}
              label={filter.label}
              data-testid="radio"
            />
          </div>
        ))}
      </RadioGroup>
      <div className={styles.DropdownContainer}>
        <Dropdown
          options={[
            { id: 'open', label: 'Open' },
            { id: 'closed', label: 'Closed' },
          ]}
          placeholder="Status"
          field={{ value: status, onChange: (event: any) => setStatus(event.target.value) }}
        ></Dropdown>
      </div>
    </div>
  );

  const secondaryButton = (
    <div>
      <Button variant="contained" onClick={() => setShowExportDialog(true)}>
        <ExportIcon className={styles.ExportIcon} /> Export
      </Button>
      <Button variant="contained" onClick={() => setShowBulkClose(true)}>
        Bulk Update
      </Button>
    </div>
  );

  const filter: any = { status };

  if (assignedToUser) {
    filter.userId = userId;
  }

  return (
    <>
      {dialog}
      <List
        restrictedAction={getRestrictedAction}
        title="Tickets"
        listItem="tickets"
        listItemName="ticket"
        pageLink="ticket"
        button={{ show: false }}
        secondaryButton={secondaryButton}
        listIcon={ticketIcon}
        {...queries}
        searchParameter={['body']}
        {...columnAttributes}
        additionalAction={additionalAction}
        filters={filter}
        filterList={activeFilter}
      />
    </>
  );
};

export default TicketList;
