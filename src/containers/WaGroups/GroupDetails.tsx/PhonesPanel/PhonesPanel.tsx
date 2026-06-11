import { ReactNode, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { Chip } from '@mui/material';

import { Button } from 'components/UI/Form/Button/Button';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { setErrorMessage, setNotification } from 'common/notification';
import { getUserRole } from 'context/role';
import { SET_PRIMARY_PHONE } from 'graphql/mutations/Group';
import { GET_WA_GROUP } from 'graphql/queries/WaGroups';

import styles from './PhonesPanel.module.css';

interface PhoneRow {
  id: string;
  isPrimary: boolean;
  isActive: boolean;
  waManagedPhone: {
    id: string;
    phone: string;
    label?: string | null;
    status?: string | null;
  };
}

interface PhonesPanelProps {
  phones: PhoneRow[];
  waGroupId: string;
}

export const PhonesPanel = ({ phones, waGroupId }: PhonesPanelProps) => {
  const { t } = useTranslation();
  const [targetPhone, setTargetPhone] = useState<PhoneRow | null>(null);

  const isAdmin = getUserRole().some((role: string) => role === 'Admin' || role === 'Glific_admin');

  const [setPrimaryPhone, { loading }] = useMutation(SET_PRIMARY_PHONE, {
    refetchQueries: [{ query: GET_WA_GROUP, variables: { waGroupId } }],
  });

  const handleConfirm = async () => {
    if (!targetPhone) return;
    try {
      const { data } = await setPrimaryPhone({
        variables: { waGroupId, waManagedPhoneId: targetPhone.waManagedPhone.id },
      });
      const warning = data?.setPrimaryPhone?.warning;
      if (warning) {
        setNotification(warning, 'warning');
      } else {
        setNotification(t('Primary phone updated successfully.'), 'success');
      }
    } catch (error) {
      setErrorMessage(error as Error);
    } finally {
      setTargetPhone(null);
    }
  };

  const renderPhoneRow = (row: PhoneRow) => {
    const phone = row.waManagedPhone;
    const status = phone.status;
    const isActiveStatus = status === 'active';

    return (
      <div key={row.id} className={styles.PhoneRow} data-testid={`phone-row-${phone.id}`}>
        <div className={styles.PhoneInfo}>
          <div className={styles.PhoneNumber}>{phone.label || phone.phone}</div>
          <div className={styles.PhoneSubtitle}>
            {phone.label && <span>{phone.phone}</span>}
            {status && (
              <span
                className={`${styles.StatusDot} ${isActiveStatus ? styles.StatusActive : styles.StatusInactive}`}
                data-testid={`status-${phone.id}`}
                title={status}
              >
                <span className={styles.StatusDotMarker} /> {status}
              </span>
            )}
          </div>
        </div>
        <div className={styles.Badges}>
          {row.isPrimary && (
            <Chip data-testid="primary-badge" label={t('Primary')} size="small" className={styles.PrimaryBadge} />
          )}
        </div>
        <div className={styles.Action}>
          {isAdmin && !row.isPrimary && (
            <Button
              data-testid={`set-primary-${phone.id}`}
              onClick={() => setTargetPhone(row)}
              variant="outlined"
              color="primary"
              size="small"
              className={styles.SetPrimaryButton}
            >
              {t('Set as primary')}
            </Button>
          )}
        </div>
      </div>
    );
  };

  const statusWarning =
    targetPhone && targetPhone.waManagedPhone.status && targetPhone.waManagedPhone.status !== 'active'
      ? t("This phone's status is")
      : null;

  let dialog: ReactNode = null;
  if (targetPhone) {
    dialog = (
      <DialogBox
        title={t('Make this phone the primary?')}
        handleOk={handleConfirm}
        handleCancel={() => setTargetPhone(null)}
        colorOk="warning"
        alignButtons="center"
        buttonOkLoading={loading}
      >
        <div className={styles.DialogBody} data-testid="confirm-set-primary">
          <div>
            {t('The current primary will be demoted and ')}
            <strong>{targetPhone.waManagedPhone.label || targetPhone.waManagedPhone.phone}</strong>
            {t(' will become the new primary for this group.')}
          </div>
          {statusWarning && (
            <div className={styles.StatusWarning} data-testid="status-warning">
              {statusWarning} <strong>{targetPhone.waManagedPhone.status}</strong>
              {t('. Messages may fail until it reconnects to WhatsApp.')}
            </div>
          )}
        </div>
      </DialogBox>
    );
  }

  const activePhones = (phones || []).filter((p) => p.isActive);

  if (activePhones.length === 0) {
    return (
      <div className={styles.Empty} data-testid="phones-empty">
        {t('No phones are linked to this group yet.')}
      </div>
    );
  }

  return (
    <div className={styles.Container} data-testid="phones-panel">
      <h3 className={styles.Heading}>{t('Phones')}</h3>
      <p className={styles.Subheading}>
        {t('Phones connected to this group. Only the primary phone is used to send messages.')}
      </p>
      <div className={styles.List}>{activePhones.map(renderPhoneRow)}</div>
      {dialog}
    </div>
  );
};

export default PhonesPanel;
