import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import SyncIcon from '@mui/icons-material/Sync';

import { List } from 'containers/List/List';
import { getUserRole } from 'context/role';
import { setErrorMessage, setNotification } from 'common/notification';
import { GET_WA_MANAGED_PHONES, GET_WA_MANAGED_PHONES_COUNT } from 'graphql/queries/WaGroups';
import { SYNC_WA_MANAGED_PHONE_STATUSES } from 'graphql/mutations/Group';
import { SHORT_DATE_TIME_FORMAT } from 'common/constants';

import { ReconnectDialog } from './ReconnectDialog';
import styles from './PhoneManagement.module.css';

// A phone in these Maytapi states can still send/receive; anything else is
// surfaced as unhealthy (mirrors the backend classification).
const HEALTHY_STATUSES = ['active', 'loading'];
const isHealthy = (status?: string | null) => !!status && HEALTHY_STATUSES.includes(status);

const queries = {
  countQuery: GET_WA_MANAGED_PHONES_COUNT,
  filterItemsQuery: GET_WA_MANAGED_PHONES,
  deleteItemQuery: null,
};

// Health dashboard only — no inline create/edit/delete.
const restrictedAction = () => ({ delete: false, edit: false });

const getText = (text: string) => <div className={styles.TableText}>{text}</div>;

const getStatusBadge = (status?: string | null) => (
  <span className={`${styles.Badge} ${isHealthy(status) ? styles.Healthy : styles.Unhealthy}`}>
    {status || 'unknown'}
  </span>
);

const columnStyles = [styles.Phone, styles.Label, styles.Status, styles.LastChecked];

interface ManagedPhone {
  id: string;
  phone: string;
  label?: string | null;
  status?: string | null;
  lastStatusCheckedAt?: string | null;
}

export const PhoneManagement = () => {
  const { t } = useTranslation();
  const roles = getUserRole();
  const isAdmin = roles.includes('Admin') || roles.includes('Glific_admin');
  const canSync = isAdmin || roles.includes('Manager');

  const [reconnectPhone, setReconnectPhone] = useState<ManagedPhone | null>(null);
  const [refreshList, setRefreshList] = useState(false);

  const [syncStatuses] = useMutation(SYNC_WA_MANAGED_PHONE_STATUSES);

  // Re-poll Maytapi for every phone's status, then refresh the list in place.
  const handleSync = async () => {
    try {
      const { data } = await syncStatuses();
      const result = data?.syncWaManagedPhoneStatuses;
      const errors = result?.errors;
      if (errors?.length) {
        setNotification(
          errors
            .map((error: { message?: string }) => error?.message)
            .filter(Boolean)
            .join('; '),
          'warning'
        );
        return;
      }
      setNotification(result?.message || t('WhatsApp phone statuses have been refreshed.'), 'success');
      setRefreshList((previous) => !previous);
    } catch (error) {
      setErrorMessage(error as Error);
    }
  };

  const getColumns = (phone: ManagedPhone) => ({
    phone: getText(phone.phone),
    label: getText(phone.label || '—'),
    status: getStatusBadge(phone.status),
    lastChecked: getText(
      phone.lastStatusCheckedAt ? dayjs(phone.lastStatusCheckedAt).format(SHORT_DATE_TIME_FORMAT) : '—'
    ),
  });

  const columnNames = [
    { name: 'phone', label: t('Phone'), sort: true, order: 'asc' },
    { label: t('Label') },
    { label: t('Status') },
    { label: t('Last checked') },
    { label: t('Actions') },
  ];

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  // Reconnect is admin-only and only offered when the phone is not active
  // (an active phone has nothing to reconnect).
  const additionalAction = (phone: ManagedPhone) => [
    {
      icon: <QrCode2Icon data-testid="reconnectIcon" />,
      parameter: 'id',
      label: t('Reconnect'),
      dialog: (_id: string, item: ManagedPhone) => setReconnectPhone(item),
      hidden: !isAdmin || phone.status === 'active',
    },
  ];

  return (
    <>
      <List
        title={t('WhatsApp phones')}
        listItem="waManagedPhones"
        listItemName="waManagedPhone"
        pageLink="group/phones"
        searchParameter={['phone']}
        button={
          canSync
            ? { show: true, label: t('Sync statuses'), action: handleSync, symbol: <SyncIcon /> }
            : { show: false }
        }
        refreshList={refreshList}
        dialogMessage=""
        {...queries}
        restrictedAction={restrictedAction}
        additionalAction={additionalAction}
        {...columnAttributes}
      />

      {reconnectPhone && (
        <ReconnectDialog
          phone={reconnectPhone}
          onClose={() => setReconnectPhone(null)}
          onReconnected={() => setReconnectPhone(null)}
        />
      )}
    </>
  );
};

export default PhoneManagement;
