import { Checkbox, Dialog, FormControlLabel } from '@mui/material';

import styles from './TermsAndConditions.module.css';
import { Button } from 'components/UI/Form/Button/Button';
import { useState } from 'react';
import { TermsAndConditionsText } from './TermsAndConditionsText';

interface TermsAndConditionsProps {
  openReachOutToUs?: Function;
  field: any;
  form: { dirty: any; touched: any; errors: any; setFieldValue: any; values: any };
}

export const TermsAndConditions = ({
  openReachOutToUs,
  field,
  form: { setFieldValue, errors },
}: TermsAndConditionsProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { terms_agreed, support_staff_account } = field.value;
  console.log(errors);

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
      <div className={styles.Container}>
        <div className={styles.TermsAndCondition}>
          <TermsAndConditionsText />
        </div>

        <div className={styles.Buttons}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              setFieldValue('permissions', {
                terms_agreed: false,
                support_staff_account,
              });
              if (openReachOutToUs) openReachOutToUs(true);
            }}
          >
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
    <div>
      <FormControlLabel
        control={
          <Checkbox
            data-testid="checkboxLabel"
            {...field}
            color="primary"
            checked={terms_agreed || false}
            onChange={() => setDialogOpen(true)}
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
      {errors && errors.permissions && errors.permissions.terms_agreed && (
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

      {errors && errors.permissions && errors.permissions.support_staff_account && (
        <p className={styles.Error}>{errors.permissions.support_staff_account}</p>
      )}

      {dialogOpen && dialog}
    </div>
  );
};
