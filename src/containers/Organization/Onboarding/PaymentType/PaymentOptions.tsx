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
          <div className={styles.RadioLabelWrapper}>
            <FormControlLabel
              data-testid="radio-btn"
              value={'yearly'}
              checked={isChecked('yearly')}
              control={<Radio color="primary" />}
              label={'Yearly'}
              className={isChecked('yearly') ? styles.Selectedlabel : styles.Label}
            />
            <div className={styles.Recommended}>One month fee waived off!</div>
          </div>
          <div className={styles.RadioLabelWrapper}>
            <FormControlLabel
              data-testid="radio-btn"
              value={'quarterly'}
              checked={isChecked('quarterly')}
              control={<Radio color="primary" />}
              label={'Quarterly'}
              className={isChecked('quarterly') ? styles.Selectedlabel : styles.Label}
            />
          </div>
          <div className={styles.RadioLabelWrapper}>
            <FormControlLabel
              data-testid="radio-btn"
              value={'monthly'}
              checked={isChecked('monthly')}
              control={<Radio color="primary" />}
              label={'Monthly'}
              className={isChecked('monthly') ? styles.Selectedlabel : styles.Label}
            />
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};
