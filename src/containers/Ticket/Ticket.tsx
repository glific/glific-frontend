import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Input } from 'components/UI/Form/Input/Input';

import { FormLayout } from 'containers/Form/FormLayout';
import { SupportAgent } from '@mui/icons-material';
import { GET_TICKET } from 'graphql/queries/Ticket';
import { UPDATE_TICKET } from 'graphql/mutations/Ticket';

import styles from './Ticket.module.css';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import dayjs from 'dayjs';
import { useQuery } from '@apollo/client';
import { GET_USERS } from 'graphql/queries/User';
import { setVariables } from 'common/constants';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import Loading from 'components/UI/Layout/Loading/Loading';

export interface TicketProps {
  setOpenDialog: Function;
  selectedTicket: any;
}

const TicketDetails = ({ form }: any) => {
  const { values } = form;
  return (
    <div className={styles.Container}>
      <h3 className={styles.Content}>
        <span className={styles.Bold}> {values.body}</span>
      </h3>

      <p className={styles.Content}>
        <span className={styles.Bold}>Opened: </span>
        {dayjs(values.insertedAt).format('MMMM DD, YYYY, [at] HH:mm:ss')}
      </p>
      <p className={styles.Content}>
        <span className={styles.Bold}> Last updated: </span>
        {dayjs(values.updatedAt).format('MMMM DD, YYYY, [at] HH:mm:ss')}
      </p>
    </div>
  );
};

export const Ticket = ({ selectedTicket, setOpenDialog }: TicketProps) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [user, setUser] = useState({});
  const [insertedAt, setInsertedAt] = useState('');
  const [body, setBody] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  const { data, loading } = useQuery(GET_USERS, {
    variables: setVariables(),
  });

  const states = {
    status,
    remarks,
    insertedAt,
    body,
    user,
    updatedAt,
  };

  const setStates = ({
    status: statusValue,
    remarks: remarksValue,
    body: bodyValue,
    insertedAt: insertedAtValue,
    updatedAt: updatedAtValue,
    user: userValue,
  }: any) => {
    setStatus(statusValue);
    setBody(bodyValue);
    setInsertedAt(insertedAtValue);
    setUpdatedAt(updatedAtValue);
    setRemarks(remarksValue);
    setUser(userValue.name);
  };

  const setPayload = (payload: any) => ({
    status: payload.status,
    remarks: payload.remarks,
    userId: payload.user.id,
  });

  const queries: any = {
    getItemQuery: GET_TICKET,
    createItemQuery: UPDATE_TICKET,
    updateItemQuery: UPDATE_TICKET,
    deleteItemQuery: UPDATE_TICKET,
  };

  const formFields = [
    {
      component: TicketDetails,
      name: 'detail',
    },
    {
      component: Dropdown,
      name: 'status',
      placeholder: t('Ticket status'),
      options: [
        { id: 'open', label: 'Open' },
        { id: 'closed', label: 'Closed' },
      ],
    },

    {
      component: AutoComplete,
      name: 'user',
      multiple: false,
      options: data ? data.users : [],
      optionLabel: 'name',
      textFieldProps: {
        label: t('Change assignee'),
        variant: 'outlined',
      },
    },
    {
      component: Input,
      name: 'remarks',
      type: 'text',
      rows: 3,
      textArea: true,
      placeholder: t('Remarks'),
    },
  ];

  const ticketIcon = <SupportAgent className={styles.TicketIcon} />;

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={`${styles.Layout} ${styles.Edit}`}>
      <FormLayout
        {...queries}
        restrictDelete
        title={t('Update ticket')}
        listItem="ticket"
        listItemName="Ticket"
        formFields={formFields}
        pageLink="ticket"
        afterSave={() => setOpenDialog(false)}
        cancelAction={() => setOpenDialog(false)}
        states={states}
        setStates={setStates}
        setPayload={setPayload}
        redirectionLink="ticket"
        icon={ticketIcon}
        languageSupport={false}
        entityId={selectedTicket}
      />
    </div>
  );
};

export default Ticket;
