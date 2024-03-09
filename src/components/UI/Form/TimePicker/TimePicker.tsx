import { useState } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, TimePicker as Picker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { getIn } from 'formik';
import utc from 'dayjs/plugin/utc';

import styles from './TimePicker.module.css';
dayjs.extend(utc);

export interface TimePickerProps {
  variant?: any;
  inputVariant?: any;
  field: any;
  form: { dirty: any; touched: any; errors: any; setFieldValue: any };
  placeholder: string;
  disabled?: boolean;
  helperText?: string;
}

export const TimePicker = ({
  field,
  form: { setFieldValue, errors, touched },
  placeholder,
  disabled = false,
  helperText,
}: TimePickerProps) => {
  const timeValue = field.value ? field.value : null;
  const [open, setOpen] = useState(false);

  const errorText = getIn(errors, field.name);
  const touchedVal = getIn(touched, field.name);
  const hasError = touchedVal && errorText !== undefined;

  const handleDateChange = (time: Date | null) => {
    const value = time ? time : null;
    setFieldValue(field.name, value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={styles.TimePicker} data-testid="time-picker">
        <Picker
          className={styles.Picker}
          label={placeholder}
          open={open}
          value={timeValue}
          onClose={() => setOpen(false)}
          disabled={disabled}
          onChange={handleDateChange}
          slotProps={{
            textField: {
              inputProps: {
                className: styles.Input,
              },
              InputLabelProps: {
                className: styles.Label,
              },
              helperText: hasError ? errorText : '',
              error: hasError,
              onClick: () => !disabled && setOpen(true),
            },
          }}
        />
        {helperText && (
          <div id="helper-text" className={styles.HelperText}>
            {helperText}
          </div>
        )}
      </div>
    </LocalizationProvider>
  );
};
