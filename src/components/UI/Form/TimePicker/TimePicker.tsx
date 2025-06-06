import { useState } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, TimePicker as Picker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
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

const TimePickerStyles = {
  '.MuiPickersOutlinedInput-root': {
    borderRadius: '12px',
    borderWidth: '2px',
  },
};

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

  const handleDateChange = (time: Dayjs | null) => {
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
                'data-testid': placeholder,
              },
              InputLabelProps: {
                className: styles.Label,
              },
              helperText: hasError ? errorText : '',
              error: hasError,
              onClick: () => !disabled && setOpen(true),
            },
          }}
          sx={TimePickerStyles}
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
