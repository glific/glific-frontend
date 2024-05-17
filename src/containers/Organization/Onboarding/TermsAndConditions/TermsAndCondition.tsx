import { useState } from 'react';
import { Checkbox, Dialog, FormControlLabel } from '@mui/material';
import axios from 'axios';

import { ONBOARD_URL_UPDATE } from 'config';
import styles from './TermsAndConditions.module.css';
import { Button } from 'components/UI/Form/Button/Button';
import { TermsAndConditionsText } from './TermsAndConditionsText';

interface TermsAndConditionsProps {
  openReachOutToUs: Function;
  field: any;
  form: { dirty?: any; touched: any; errors: any; setFieldValue: any; values?: any };
}

export const TermsAndConditions = ({
  openReachOutToUs,
  field,
  form: { setFieldValue, errors, touched },
}: TermsAndConditionsProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { terms_agreed, support_staff_account } = field.value;

  const handleDisagree = async () => {
    setFieldValue('permissions', {
      terms_agreed: false,
      support_staff_account,
    });
    openReachOutToUs(true);

    const data = localStorage.getItem('registrationData');
    if (data) {
      let registrationData = JSON.parse(data);
      const payload = {
        registration_id: registrationData.registration_details.registration_id,
        org_id: registrationData.registration_details.org_id,
        terms_agreed: false,
        has_submitted: false,
      };

      await axios.post(ONBOARD_URL_UPDATE, payload);
    }
    setDialogOpen(false);
  };

  const dialog = (
    <Dialog
      classes={{
        paper: styles.DialogboxPaper,
      }}
      maxWidth="lg"
      fullWidth={true}
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
    >
      <div className={styles.TermsAndCondition}>
        <TermsAndConditionsText />
        <div className={styles.Buttons}>
          <Button variant="outlined" color="primary" onClick={handleDisagree}>
            I Disagree
          </Button>
          <Button
            variant="contained"
            color="primary"
            data-testid="previewButton"
            onClick={() => {
              setFieldValue('permissions', {
                terms_agreed: true,
                support_staff_account,
              });
              setDialogOpen(false);
            }}
          >
            I Agree
          </Button>
        </div>
      </div>
    </Dialog>
  );

  return (
    <div className={styles.Wrapper}>
      <FormControlLabel
        control={
          <Checkbox
            data-testid="checkboxLabel"
            {...field}
            color="primary"
            checked={terms_agreed || false}
            onChange={(event) => {
              if (event.target.checked) setDialogOpen(true);
              else
                setFieldValue('permissions', {
                  terms_agreed: false,
                  support_staff_account,
                });
            }}
          />
        }
        labelPlacement="end"
        label={
          <span>
            I agree to{' '}
            <span onClick={() => setDialogOpen(true)} className={styles.TermsAndConditions}>
              Glific Terms & conditions
            </span>
          </span>
        }
        classes={{
          label: styles.Label,
          root: styles.Root,
        }}
      />
      {touched.permissions && errors?.permissions?.terms_agreed && (
        <p className={styles.Error}>{errors.permissions.terms_agreed}</p>
      )}

      <FormControlLabel
        control={
          <Checkbox
            data-testid="checkboxLabel"
            {...field}
            color="primary"
            checked={support_staff_account || false}
            onChange={(value) => {
              setFieldValue('permissions', {
                terms_agreed,
                support_staff_account: value.target.checked,
              });
            }}
          />
        }
        labelPlacement="end"
        label={'I agree to let the Glific team create a support staff account on my Glific setup'}
        classes={{
          label: styles.Label,
          root: styles.Root,
        }}
      />
      {dialogOpen && dialog}
    </div>
  );
};
