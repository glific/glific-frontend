import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import styles from './PaymentOptions.module.css';

export interface PaymentOptionsProps {
  form: { dirty: any; touched: any; errors: any; setFieldValue: any; values: any };
}

export const PaymentOptions = ({ form: { setFieldValue, values } }: PaymentOptionsProps) => {
  const isChecked = (value: string) => values.billing_frequency === value;

  return (
    <div className={styles.PaymentTypeSection}>
      <div>
        <RadioGroup
          aria-label="trigger-type"
          name="trigger-type"
          data-testid="triggerGroupType"
          row
          value={values.billing_frequency}
          onChange={(event) => {
            setFieldValue('billing_frequency', event.target.value);
          }}
          className={styles.Wrapper}
        >
          <div className={`${styles.RadioLabelWrapper} ${styles.Year}`}>
            <FormControlLabel
              data-testid="radio-btn"
              value={'Annually'}
              checked={isChecked('Annually')}
              control={<Radio color="primary" />}
              label={'Annually'}
              className={isChecked('Annually') ? styles.Selectedlabel : styles.Label}
            />
            <div className={styles.Recommended}>One month fee waived off!</div>
          </div>
          <div className={styles.RadioLabelWrapper}>
            <FormControlLabel
              data-testid="radio-btn"
              value={'Quarterly'}
              checked={isChecked('Quarterly')}
              control={<Radio color="primary" />}
              label={'Quarterly'}
              className={isChecked('Quarterly') ? styles.Selectedlabel : styles.Label}
            />
          </div>
          <div className={styles.RadioLabelWrapper}>
            <FormControlLabel
              data-testid="radio-btn"
              value={'Monthly'}
              checked={isChecked('Monthly')}
              control={<Radio color="primary" />}
              label={'Monthly'}
              className={isChecked('Monthly') ? styles.Selectedlabel : styles.Label}
            />
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};
