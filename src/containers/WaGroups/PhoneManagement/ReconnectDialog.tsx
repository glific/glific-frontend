import { useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { CircularProgress } from '@mui/material';

import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { setErrorMessage, setNotification } from 'common/notification';
import { WHATSAPP_PHONE_SCREEN } from 'graphql/queries/WaGroups';
import { RECONNECT_WA_MANAGED_PHONE } from 'graphql/mutations/Group';

import styles from './PhoneManagement.module.css';

// Maytapi rotates the QR, so re-poll the screen while the dialog is open.
const QR_POLL_MS = 20000;

export interface ReconnectDialogProps {
  phone: { id: string; phone: string; label?: string | null };
  onClose: () => void;
  onReconnected: () => void;
}

export const ReconnectDialog = ({ phone, onClose, onReconnected }: ReconnectDialogProps) => {
  const { t } = useTranslation();

  const { data, loading, refetch } = useQuery(WHATSAPP_PHONE_SCREEN, {
    variables: { waManagedPhoneId: phone.id },
    fetchPolicy: 'network-only',
    pollInterval: QR_POLL_MS,
  });

  const [reconnect, { loading: reconnecting }] = useMutation(RECONNECT_WA_MANAGED_PHONE);

  const screen = data?.whatsappPhoneScreen?.waPhoneScreen;
  const status = screen?.status;

  // A phone that is already `active` when the dialog opens hasn't "reconnected" —
  // only treat a flip to active as success once we've actually seen it in a
  // pending (non-active) state during this session (i.e. after a log out + rescan).
  const seenPending = useRef(false);

  useEffect(() => {
    if (!status) return;

    if (status !== 'active') {
      seenPending.current = true;
    } else if (seenPending.current) {
      setNotification(t('WhatsApp phone reconnected.'), 'success');
      onReconnected();
    }
  }, [status]);

  const handleReconnect = async () => {
    try {
      const { data: response } = await reconnect({ variables: { waManagedPhoneId: phone.id } });
      const errors = response?.reconnectWaManagedPhone?.errors;
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
      setNotification(t('Logged the phone out. Scan the new QR code to reconnect.'), 'success');
      refetch();
    } catch (error) {
      setErrorMessage(error as Error);
    }
  };

  return (
    <DialogBox
      title={`${t('Reconnect')} ${phone.label || phone.phone}`}
      handleOk={handleReconnect}
      handleCancel={onClose}
      buttonOk={t('Log out & refresh QR')}
      buttonOkLoading={reconnecting}
      buttonCancel={t('Close')}
      alignButtons="center"
    >
      <div className={styles.QrWrapper} data-testid="reconnectDialog">
        <p>{t('On the phone open WhatsApp, go to Linked devices, tap Link a device, then scan this QR code.')}</p>

        {loading && !screen ? (
          <CircularProgress data-testid="qrLoading" />
        ) : screen?.code ? (
          <img className={styles.Qr} src={screen.code} alt={t('WhatsApp QR code')} data-testid="qrImage" />
        ) : (
          <p data-testid="qrUnavailable">{t('The QR code is not available yet. Try refreshing.')}</p>
        )}

        {status && status !== 'active' && (
          <p className={styles.QrStatus}>
            {t('Status')}: {status}
          </p>
        )}
      </div>
    </DialogBox>
  );
};

export default ReconnectDialog;
