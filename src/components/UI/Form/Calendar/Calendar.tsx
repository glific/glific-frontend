import React, { useState } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { TextField } from '@mui/material';
import 'date-fns';
import { getIn } from 'formik';

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
  format = 'MM/dd/yyyy',
  field,
  disabled = false,
  form: { setFieldValue, errors, touched },
  placeholder,
  minDate,
}: CalendarProps) => {
  const errorText = getIn(errors, field.name);
  const touchedVal = getIn(touched, field.name);
  const hasError = touchedVal && errorText !== undefined;
  const dateValue = field.value ? field.value : null;
  const [open, setOpen] = useState(false);

  const handleDateChange = (date: Date | null | string) => {
    if (date) {
      if (date.toString() !== 'Invalid Date') {
        setFieldValue(field.name, date);
      }
    } else {
      setFieldValue(field.name, null);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className={styles.Calendar}>
        <DatePicker
          label={placeholder}
          open={open}
          value={dateValue}
          inputFormat={format}
          onChange={handleDateChange}
          className={styles.CalendarInput}
          disabled={disabled}
          minDate={minDate}
          InputProps={{
            error: hasError,
            onClick: () => !disabled && setOpen(true),
          }}
          onClose={() => setOpen(false)}
          renderInput={(params) => (
            <TextField
              helperText={hasError ? errorText : ''}
              data-testid="date-picker-inline"
              {...params}
            />
          )}
        />
      </div>
    </LocalizationProvider>
  );
};
