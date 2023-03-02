import { useState } from 'react';
import 'date-fns';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker as Picker } from '@mui/x-date-pickers';
import moment from 'moment';
import { TextField } from '@mui/material';
import { getIn } from 'formik';

import styles from './TimePicker.module.css';

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
  moment.defaultFormat = 'Thh:mm:ss';
  const timeValue = field.value ? moment(field.value, moment.defaultFormat).toDate() : null;
  const [open, setOpen] = useState(false);

  const errorText = getIn(errors, field.name);
  const touchedVal = getIn(touched, field.name);
  const hasError = touchedVal && errorText !== undefined;

  const handleDateChange = (time: Date | null) => {
    const value = time ? moment(time).format('THH:mm:ss') : null;
    setFieldValue(field.name, value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className={styles.TimePicker}>
        <Picker
          className={styles.Picker}
          label={placeholder}
          open={open}
          InputProps={{
            error: hasError,
            onClick: () => !disabled && setOpen(true),
          }}
          onClose={() => setOpen(false)}
          disabled={disabled}
          value={timeValue}
          onChange={handleDateChange}
          renderInput={(params) => (
            <TextField
              data-testid="time-picker"
              helperText={hasError ? errorText : ''}
              {...params}
              error={hasError}
            />
          )}
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
