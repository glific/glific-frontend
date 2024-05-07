import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import styles from './PaymentOptions.module.css';

export interface PaymentOptionsProps {
  form: { dirty: any; touched: any; errors: any; setFieldValue: any; values: any };
  handleOnChange: any;
  billing_frequency: any;
}

export const PaymentOptions = ({
  handleOnChange,
  billing_frequency,
  form: { setFieldValue },
}: PaymentOptionsProps) => {
  const isChecked = (value: string) => billing_frequency === value;

  return (
    <div className={styles.PaymentTypeSection}>
      <div>
        <RadioGroup
          aria-label="trigger-type"
          name="trigger-type"
          data-testid="triggerGroupType"
          row
          value={billing_frequency}
          onChange={(event) => {
            handleOnChange(event.target.value);
            setFieldValue(event.target.value);
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
            <div className={styles.Recommended}>Enjoy a whole month free! Fee waived off!</div>
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
