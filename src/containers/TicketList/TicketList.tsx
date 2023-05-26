import { useTranslation } from 'react-i18next';
import { DELETE_TRIGGER } from 'graphql/mutations/Trigger';
import { List } from 'containers/List/List';
import styles from './TicketList.module.css';
import { ReactComponent as EditIcon } from 'assets/images/icons/Edit.svg';
import { TICKET_COUNT_QUERY, TICKET_LIST_QUERY } from 'graphql/queries/Ticket';
import { useState } from 'react';
import { Dialog, DialogContent, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import Ticket from 'containers/Ticket/Ticket';
import { SupportAgent } from '@mui/icons-material';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import { getUserSession } from 'services/AuthService';

const getBody = (body: any) => <div className={styles.TableText}>{body}</div>;
const getStatus = (status: string) => {
  let showStatus;
  switch (status) {
    case 'open':
      showStatus = <div className={styles.Success}>{status}</div>;
      break;
    case 'closed':
      showStatus = <div className={styles.ErrorStyle}>{status}</div>;
      break;
    default:
      showStatus = status;
  }

  return <div className={styles.StatusContainer}>{showStatus}</div>;
};

const getLabel = (label: any) => <div className={styles.LabelText}>{label}</div>;
const getUser = (user: any) => <div className={styles.TableText}>{user?.name}</div>;

const getColumns = ({ body, status, topic, user }: any) => ({
  label: getLabel(topic),
  body: getBody(body),
  status: getStatus(status),
  user: getUser(user),
});

const columnStyles = [styles.Label, styles.Issue, styles.Status, styles.Assigned, styles.Actions];
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

  const columnNames: any = [
    { name: 'topic', label: t('Label') },
    { name: 'body', label: t('Issue') },
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
      dialog: (id: any) => {
        setSelectedTicket(id);
        setOpenDialog(true);
      },
      label: t('Add remark'),
    },
  ];

  console.log();

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
        listIcon={ticketIcon}
        {...queries}
        {...columnAttributes}
        additionalAction={additionalAction}
        filters={filter}
        filterList={activeFilter}
      />
    </>
  );
};

export default TicketList;
