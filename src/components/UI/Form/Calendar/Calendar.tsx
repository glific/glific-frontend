import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
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
  variant = 'inline',
  inputVariant = 'outlined',
  format = 'MM/dd/yyyy',
  field,
  disabled = false,
  form: { touched, errors, setFieldValue },
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
      if (date !== 'Invalid Date') setFieldValue(field.name, date);
    } else {
      setFieldValue(field.name, null);
    }
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Grid className={styles.Calendar}>
        <KeyboardDatePicker
          error={hasError}
          autoOk
          open={open}
          variant={variant}
          inputVariant={inputVariant}
          format={format}
          className={styles.CalendarInput}
          disabled={disabled}
          data-testid="date-picker-inline"
          label={placeholder}
          value={dateValue}
          onClick={() => !disabled && setOpen(true)}
          onClose={() => setOpen(false)}
          onChange={handleDateChange}
          helperText={hasError ? errorText : ''}
          minDate={minDate}
        />
      </Grid>
    </MuiPickersUtilsProvider>
  );
};
