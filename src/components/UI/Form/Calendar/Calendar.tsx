import React from 'react';
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

export const Calendar: React.FC<CalendarProps> = ({
  variant = 'inline',
  inputVariant = 'outlined',
  format = 'MM/dd/yyyy',
  field,
  disabled = false,
  form: { touched, errors, setFieldValue },
  placeholder,
  minDate,
}) => {
  const errorText = getIn(errors, field.name);
  const touchedVal = getIn(touched, field.name);
  const hasError = touchedVal && errorText !== undefined;
  const dateValue = field.value ? field.value : null;

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
          variant={variant}
          inputVariant={inputVariant}
          format={format}
          disabled={disabled}
          data-testid="date-picker-inline"
          label={placeholder}
          value={dateValue}
          onChange={handleDateChange}
          helperText={hasError ? errorText : ''}
          minDate={minDate}
        />
      </Grid>
    </MuiPickersUtilsProvider>
  );
};
