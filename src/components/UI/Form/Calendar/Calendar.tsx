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
  KeyboardButtonProps: object;
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

  const dateValue = field.value ? field.value : new Date();
  const defaultDateValue = field.value ? field.value : setFieldValue(field.name, new Date());

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFieldValue(field.name, date);
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
          margin="none"
          id="date-picker-inline"
          label={placeholder}
          value={dateValue}
          onChange={handleDateChange}
          helperText={hasError ? errorText : ''}
        />
      </Grid>
    </MuiPickersUtilsProvider>
  );
};
