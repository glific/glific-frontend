import { FormControl, MenuItem, Select } from '@mui/material';
import { Button } from 'components/UI/Form/Button/Button';

import styles from './WaManagedPhones.module.css';
import { GET_WA_MANAGED_PHONES } from 'graphql/queries/WA_Groups';
import { useMutation, useQuery } from '@apollo/client';
import { SYNC_GROUPS } from 'graphql/mutations/Group';
import { setNotification } from 'common/notification';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface WaManagedPhonesProps {
  phonenumber: string;
  setPhonenumber: any;
}

export const WaManagedPhones = ({ phonenumber, setPhonenumber }: WaManagedPhonesProps) => {
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  const { data } = useQuery<any>(GET_WA_MANAGED_PHONES, {
    variables: {
      filter: {},
      opts: {
        limit: 3,
      },
    },
  });

  const [syncGroups] = useMutation(SYNC_GROUPS, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log(data);
      setSyncLoading(false);

      if (data.errors) {
        setNotification(t('Sorry, failed to sync whatsapp groups.'), 'warning');
      } else {
        setNotification(t('Whatsapp groups synced successfully.'), 'success');
      }
    },
    onError: () => {
      setNotification(t('Sorry, failed to sync whatsapp groups.'), 'warning');
      setSyncLoading(false);
    },
  });

  const handleSyncGroups = () => {
    setSyncLoading(true);
    syncGroups();
  };

  return (
    <div className={styles.DropDownContainer}>
      <FormControl className={styles.FormStyle}>
        <Select
          aria-label="maytapi-phonenumber"
          name="maytapi-phonenumber"
          value={phonenumber}
          onChange={(event) => {
            const { value } = event.target;
            setPhonenumber(value);
          }}
          className={styles.DropDown}
        >
          {data?.waManagedPhones?.map((phonenumber: any) => (
            <MenuItem key={phonenumber.id} value={phonenumber.id}>
              {phonenumber.phone}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="outlined"
        color="primary"
        className={styles.syncButton}
        loading={syncLoading}
        data-testid="syncGroups"
        aria-hidden="true"
        onClick={() => handleSyncGroups()}
      >
        SYNC
      </Button>
    </div>
  );
};
