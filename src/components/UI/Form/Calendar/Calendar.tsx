import React, { useState } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { TextField } from '@mui/material';
import 'date-fns';
// import { getIn } from 'formik';

import styles from './Calendar.module.css';

export interface CalendarProps {
  variant?: any;
  inputVariant?: any;
  format?: string;
  field: any;
  disabled?: boolean;
  form: { dirty: any; touched: any; errors: any; setFieldValue: any };
  placeholder: string;
  minDate?: any;
}

export const Calendar = ({
  // variant = 'inline',
  // inputVariant = 'outlined',
  format = 'MM/dd/yyyy',
  field,
  disabled = false,
  form: { setFieldValue },
  placeholder,
  minDate,
}: CalendarProps) => {
  // const errorText = getIn(errors, field.name);
  // const touchedVal = getIn(touched, field.name);
  // const hasError = touchedVal && errorText !== undefined;
  const dateValue = field.value ? field.value : null;
  const [open, setOpen] = useState(false);

  const handleDateChange = (date: Date | null | string) => {
    if (date) {
      if (date !== 'Invalid Date') setFieldValue(field.name, date);
    } else {
      setFieldValue(field.name, null);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={placeholder}
        open={open}
        value={dateValue}
        inputFormat={format}
        onChange={handleDateChange}
        className={styles.CalendarInput}
        disabled={disabled}
        data-testid="date-picker-inline"
        minDate={minDate}
        InputProps={{
          onClick: () => !disabled && setOpen(true),
        }}
        onClose={() => setOpen(false)}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
};
