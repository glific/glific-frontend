import React, { useState } from 'react';
import 'date-fns';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker as Picker } from '@mui/x-date-pickers';
import moment from 'moment';
import { TextField } from '@mui/material';
// import { getIn } from 'formik';
// import ScheduleIcon from '@mui/icons-material/Schedule';

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
  // variant = 'inline',
  // inputVariant = 'outlined',
  field,
  form: { setFieldValue },
  placeholder,
  disabled = false,
  helperText,
}: TimePickerProps) => {
  moment.defaultFormat = 'Thh:mm:ss';
  const timeValue = field.value ? moment(field.value, moment.defaultFormat).toDate() : null;
  const [open, setOpen] = useState(false);

  // const errorText = getIn(errors, field.name);
  // const touchedVal = getIn(touched, field.name);
  // const hasError = touchedVal && errorText !== undefined;

  const handleDateChange = (time: Date | null) => {
    const value = time ? moment(time).format('THH:mm:ss') : null;
    setFieldValue(field.name, value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Picker
        className={styles.picker}
        label={placeholder}
        data-testid="time-picker"
        mask="__:__ _M"
        open={open}
        InputProps={{
          onClick: () => !disabled && setOpen(true),
        }}
        onClose={() => setOpen(false)}
        disabled={disabled}
        value={timeValue}
        onChange={handleDateChange}
        renderInput={(params) => <TextField {...params} />}
      />
      {helperText && (
        <div id="helper-text" className={styles.HelperText}>
          {helperText}
        </div>
      )}
    </LocalizationProvider>
  );
};
