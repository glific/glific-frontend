import { CircularProgress, FormControl } from '@mui/material';
import { Button } from 'components/UI/Form/Button/Button';

import styles from './WaManagedPhones.module.css';
import { GET_WA_MANAGED_PHONES } from 'graphql/queries/WA_Groups';
import { useMutation, useQuery } from '@apollo/client';
import { SYNC_GROUPS } from 'graphql/mutations/Group';
import { setNotification } from 'common/notification';
import { useTranslation } from 'react-i18next';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import { useState } from 'react';

interface WaManagedPhonesProps {
  phonenumber: any;
  setPhonenumber: any;
}
const WaManagedPhones = ({ phonenumber, setPhonenumber }: WaManagedPhonesProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

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
    onCompleted: (responseData) => {
      if (responseData.errors) {
        setNotification(t('Sorry, failed to sync whatsapp groups.'), 'warning');
      } else {
        setNotification(t('Whatsapp groups synced successfully.'), 'success');
      }
      setLoading(false);
    },
    onError: () => {
      setNotification(t('Sorry, failed to sync whatsapp groups.'), 'warning');
      setLoading(false);
    },
  });

  const handleSyncGroups = () => {
    setLoading(true);
    syncGroups();
  };

  return (
    <div className={styles.DropDownContainer}>
      <FormControl className={styles.FormStyle}>
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
      </FormControl>

      <Button
        variant="outlined"
        color="primary"
        className={styles.syncButton}
        data-testid="syncGroups"
        aria-hidden="true"
        onClick={() => handleSyncGroups()}
      >
        {loading ? <CircularProgress size={20} /> : 'SYNC'}
      </Button>
    </div>
  );
};

export default WaManagedPhones;
