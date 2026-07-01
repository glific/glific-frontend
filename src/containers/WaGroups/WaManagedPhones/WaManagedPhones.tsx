import { CircularProgress, FormControl } from '@mui/material';
import { Button } from 'components/UI/Form/Button/Button';

import styles from './WaManagedPhones.module.css';
import { GET_WA_MANAGED_PHONES } from 'graphql/queries/WaGroups';
import { useMutation, useQuery } from '@apollo/client';
import { SYNC_GROUPS } from 'graphql/mutations/Group';
import { setNotification } from 'common/notification';
import { useTranslation } from 'react-i18next';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { useState } from 'react';
import { CreateGroupDialog } from 'containers/WaGroups/CreateGroupDialog/CreateGroupDialog';

// The sync fails with this message when every managed phone is disconnected on
// Maytapi; we surface a reconnect prompt instead of a generic error.
const NO_ACTIVE_PHONES = 'No active phones available';

const isNoActivePhonesError = (error: any): boolean => {
  const messages = [error?.message, ...(error?.graphQLErrors?.map((e: any) => e?.message) || [])];
  return messages.some((message) => typeof message === 'string' && message.includes(NO_ACTIVE_PHONES));
};

interface WaManagedPhonesProps {
  phonenumber: any;
  setPhonenumber: any;
}
const WaManagedPhones = ({ phonenumber, setPhonenumber }: WaManagedPhonesProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [showReconnect, setShowReconnect] = useState(false);

  const { data } = useQuery<any>(GET_WA_MANAGED_PHONES, {
    variables: {
      filter: {},
    },
    fetchPolicy: 'cache-and-network',
  });

  const [syncGroups] = useMutation(SYNC_GROUPS, { fetchPolicy: 'network-only' });

  const handleSyncGroups = async () => {
    setLoading(true);
    try {
      await syncGroups();
      setNotification(t('Whatsapp groups synced successfully.'), 'success');
    } catch (error: any) {
      if (isNoActivePhonesError(error)) {
        setShowReconnect(true);
      } else {
        setNotification(t('Sorry, failed to sync whatsapp groups.'), 'warning');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.DropDownContainer}>
      <FormControl className={styles.FormStyle}>
        <div className={styles.Autocomplete}>
          <AutoComplete
            classes={{ inputRoot: styles.DropDown }}
            isFilterType
            placeholder="Phone Number"
            options={
              data?.waManagedPhones
                ? data?.waManagedPhones?.map((phone: any) => ({
                    label: phone.phone,
                    id: phone.id,
                  }))
                : []
            }
            multiple={false}
            optionLabel="label"
            onChange={(value: any) => {
              if (value) {
                setPhonenumber([value]);
              } else {
                setPhonenumber(null);
              }
            }}
            form={{ setFieldValue: () => {} }}
            field={{
              name: 'phonenumber',
              value: phonenumber?.label,
            }}
          />
        </div>
      </FormControl>

      <Button
        variant="outlined"
        color="primary"
        className={styles.syncButton}
        data-testid="syncGroups"
        aria-hidden="true"
        onClick={() => handleSyncGroups()}
      >
        {loading ? <CircularProgress data-testid="loading" size={20} /> : 'SYNC'}
      </Button>

      <Button
        variant="contained"
        color="primary"
        className={styles.createButton}
        data-testid="createGroup"
        onClick={() => setCreateOpen(true)}
      >
        {t('New group')}
      </Button>

      <CreateGroupDialog
        open={createOpen}
        phones={data?.waManagedPhones || []}
        defaultPhone={phonenumber?.[0] ? data?.waManagedPhones?.find((p: any) => p.id === phonenumber[0].id) : null}
        onClose={() => setCreateOpen(false)}
      />

      {showReconnect && (
        <DialogBox
          title={t('No active WhatsApp phones')}
          handleOk={() => setShowReconnect(false)}
          handleCancel={() => setShowReconnect(false)}
          buttonOk={t('Okay')}
          skipCancel
          alignButtons="center"
        >
          <div data-testid="reconnectDialog">
            {t(
              'None of your WhatsApp phones are connected. Please reconnect your phone on the Maytapi console and try syncing again.'
            )}
          </div>
        </DialogBox>
      )}
    </div>
  );
};

export default WaManagedPhones;
