import React from 'react';
import styles from './Calendar.module.css';
import 'date-fns';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { getIn } from 'formik';

export interface CalendarProps {
  variant?: any;
  inputVariant?: any;
  format?: string;
  field: any;
  form: { dirty: any; touched: any; errors: any; setFieldValue: any };
  placeholder: string;
}

export const Calendar: React.SFC<CalendarProps> = ({
  variant = 'inline',
  inputVariant = 'outlined',
  format = 'MM/dd/yyyy',
  field,
  form: { dirty, touched, errors, setFieldValue },
  placeholder,
}) => {
  const errorText = getIn(errors, field.name);
  const touchedVal = getIn(touched, field.name);
  const hasError = dirty && touchedVal && errorText !== undefined;
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
          autoOk
          variant={variant}
          inputVariant={inputVariant}
          format={format}
          data-testid="date-picker-inline"
          label={placeholder}
          value={dateValue}
          onChange={handleDateChange}
          helperText={hasError ? errorText : ''}
        />
      </Grid>
    </MuiPickersUtilsProvider>
  );
};
