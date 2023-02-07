import React from 'react';

import { LocalizationProvider, DateTimePicker as Picker } from '@mui/x-date-pickers';
import { TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import 'date-fns';
// import { getIn } from 'formik';

// import { ReactComponent as CalenderIcon } from 'assets/images/icons/Calendar/Calendar.svg';
import styles from './DateTimePicker.module.css';

export interface DateTimePickerProps {
  variant?: any;
  inputVariant?: any;
  format?: string;
  field: any;
  form: { dirty: any; touched: any; errors: any; setFieldValue: any };
  placeholder: string;
  minDate?: any;
  onChange?: any;
}

export const DateTimePicker = ({
  // variant = 'inline',
  // inputVariant = 'outlined',
  format = 'dd/MM/yyyy hh:mm a',
  field,
  form: { setFieldValue },
  placeholder,
  minDate,
  onChange,
}: DateTimePickerProps) => {
  // const errorText = getIn(errors, field.name);
  // const touchedVal = getIn(touched, field.name);
  // const hasError = touchedVal && errorText !== undefined;
  const dateValue = field.value ? field.value : null;

  const handleDateChange = (date: Date | null | string) => {
    const value = date && date.toString() !== 'Invalid Date' ? date : null;
    setFieldValue(field.name, value);
    if (onChange) onChange(value);
  };

  // const icon = <CalenderIcon />;
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Picker
        className={styles.Text}
        data-testid="date-picker-inline"
        renderInput={(props) => <TextField {...props} />}
        label={placeholder}
        inputFormat={format}
        value={dateValue}
        onChange={handleDateChange}
        minDate={minDate}
      />
    </LocalizationProvider>
  );
};
