import { RadioGroup, FormControlLabel, Radio, Typography } from '@mui/material';
import styles from './TriggerType.module.css';

export interface TriggerTypeProps {
  groupType: string;
  isWhatsAppGroupEnabled: boolean;
  handleOnChange?: any;
  form: { dirty: any; touched: any; errors: any; setFieldValue: any; values: any };
}
export const TriggerType = ({
  groupType,
  isWhatsAppGroupEnabled,
  handleOnChange,
  form: { setFieldValue },
}: TriggerTypeProps) => {
  const isChecked = (value: string) => groupType === value;

  const selectTriggerType = (
    <div>
      <div>
        <Typography data-testid="formLabel" variant="h5" className={styles.FieldLabel}>
          Select Trigger Type
        </Typography>
      </div>
      <div>
        <RadioGroup
          aria-label="trigger-type"
          name="trigger-type"
          row
          value={groupType}
          onChange={(event) => {
            handleOnChange(event.target.value);
            setFieldValue(event.target.value);
          }}
        >
          <div className={styles.RadioLabelWrapper}>
            <FormControlLabel
              value={'WABA'}
              checked={isChecked('WABA')}
              control={<Radio color="primary" />}
              label={'Contact'}
              className={styles.Label}
            />
          </div>
          <div className={styles.RadioLabelWrapper}>
            <FormControlLabel
              value={'WA'}
              checked={isChecked('WA')}
              control={<Radio color="primary" />}
              label={'WhatsApp Group'}
              className={styles.Label}
            />
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  return <div>{isWhatsAppGroupEnabled && selectTriggerType}</div>;
};
