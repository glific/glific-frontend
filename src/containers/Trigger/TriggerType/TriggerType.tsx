import { RadioGroup, FormControlLabel, Radio, Typography } from '@mui/material';
import styles from './TriggerType.module.css';

export interface TriggerTypeProps {
  isContact: boolean;
  setIsContact: any;
  isWhatsAppGroupEnabled: boolean;
}
export const TriggerType = ({
  isContact,
  setIsContact,
  isWhatsAppGroupEnabled,
}: TriggerTypeProps) => {
  const isChecked = (value: boolean) => isContact === value;

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
          value={isContact}
          onChange={(event) => console.log(event.target.value)}
        >
          <div className={styles.RadioLabelWrapper}>
            <FormControlLabel
              value={1}
              control={
                <Radio
                  color="primary"
                  onClick={() => setIsContact(true)}
                  checked={isChecked(true)}
                />
              }
              label={'Contact'}
              className={styles.Label}
            />
          </div>
          <div className={styles.RadioLabelWrapper}>
            <FormControlLabel
              value={0}
              control={
                <Radio
                  color="primary"
                  onClick={() => setIsContact(false)}
                  checked={isChecked(false)}
                />
              }
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
