import { useState } from 'react';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

import { Input } from 'components/UI/Form/Input/Input';

import { FormLayout } from 'containers/Form/FormLayout';
import { SupportAgent } from '@mui/icons-material';
import { GET_TICKET } from 'graphql/queries/Ticket';
import { UPDATE_TICKET } from 'graphql/mutations/Ticket';

import styles from './Ticket.module.css';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import moment from 'moment';

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
        {moment(values.insertedAt).format('MMMM DD, YYYY, [at] HH:mm:ss')}
      </p>
      <p className={styles.Content}>
        <span className={styles.Bold}> Last updated: </span>
        {moment(values.updatedAt).format('MMMM DD, YYYY, [at] HH:mm:ss')}
      </p>
    </div>
  );
};

export const Ticket = ({ selectedTicket, setOpenDialog }: TicketProps) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [insertedAt, setInsertedAt] = useState('');
  const [body, setBody] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  const states = {
    status,
    remarks,
    insertedAt,
    body,
    updatedAt,
  };

  const setStates = ({
    status: statusValue,
    remarks: remarksValue,
    body: bodyValue,
    insertedAt: insertedAtValue,
    updatedAt: updatedAtValue,
  }: any) => {
    setStatus(statusValue);
    setBody(bodyValue);
    setInsertedAt(insertedAtValue);
    setUpdatedAt(updatedAtValue);
    setRemarks(remarksValue);
  };

  const setPayload = (payload: any) => ({
    status: payload.status,
    remarks: payload.remarks,
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
      component: Input,
      name: 'remarks',
      type: 'text',
      rows: 3,
      textArea: true,
      placeholder: t('Remarks'),
      inputProp: {
        onChange: (event: any) => setRemarks(event.target.value),
      },
    },
  ];

  const ticketIcon = <SupportAgent className={styles.TicketIcon} />;

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
