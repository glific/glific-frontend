import { RadioGroup, FormControlLabel, Radio, Typography } from '@mui/material';
import styles from './TriggerType.module.css';
import { CONTACTS_COLLECTION, WA_GROUPS_COLLECTION } from 'common/constants';

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
          data-testid="triggerGroupType"
          row
          value={groupType}
          onChange={(event) => {
            handleOnChange(event.target.value);
            setFieldValue(event.target.value);
          }}
        >
          <div className={styles.RadioLabelWrapper}>
            <FormControlLabel
              data-testid="radio-btn"
              value={CONTACTS_COLLECTION}
              checked={isChecked(CONTACTS_COLLECTION)}
              control={<Radio color="primary" />}
              label={'Contact'}
              className={styles.Label}
            />
          </div>
          <div className={styles.RadioLabelWrapper}>
            <FormControlLabel
              data-testid="radio-btn"
              value={WA_GROUPS_COLLECTION}
              checked={isChecked(WA_GROUPS_COLLECTION)}
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
