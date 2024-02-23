import { FormControl, MenuItem, Select } from '@mui/material';
import { Button } from 'components/UI/Form/Button/Button';

import styles from './WaManagedPhones.module.css';
import { GET_WA_MANAGED_PHONES } from 'graphql/queries/WA_Groups';
import { useQuery } from '@apollo/client';

interface WaManagedPhonesProps {
  phonenumber: string;
  setPhonenumber: any;
}

export const WaManagedPhones = ({ phonenumber, setPhonenumber }: WaManagedPhonesProps) => {
  const { data } = useQuery<any>(GET_WA_MANAGED_PHONES, {
    variables: {
      filter: {},
      opts: {
        limit: 3,
      },
    },
    onCompleted(data) {
      setPhonenumber(data?.waManagedPhones[0].id);
    },
  });

  return (
    <div className={styles.DropDownContainer}>
      <FormControl className={styles.FormStyle}>
        <Select
          aria-label="maytapi-phonenumber"
          name="maytapi-phonenumber"
          value={phonenumber}
          onChange={(event) => {
            const { value } = event.target;
            setPhonenumber(JSON.parse(value));
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
        data-testid="updateHsm"
        aria-hidden="true"
      >
        SYNC
      </Button>
    </div>
  );
};
