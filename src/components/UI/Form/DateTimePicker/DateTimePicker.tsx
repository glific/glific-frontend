import React from 'react';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDateTimePicker } from '@material-ui/pickers';
import 'date-fns';
import { getIn } from 'formik';

import { ReactComponent as CalenderIcon } from 'assets/images/icons/Calendar/Calendar.svg';
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

export const DateTimePicker: React.SFC<DateTimePickerProps> = ({
  variant = 'inline',
  inputVariant = 'outlined',
  format = 'dd/MM/yyyy hh:mm a',
  field,
  form: { touched, errors, setFieldValue },
  placeholder,
  minDate,
  onChange,
}) => {
  const errorText = getIn(errors, field.name);
  const touchedVal = getIn(touched, field.name);
  const hasError = touchedVal && errorText !== undefined;
  const dateValue = field.value ? field.value : null;

  const handleDateChange = (date: Date | null | string) => {
    const value = date && date.toString() !== 'Invalid Date' ? date : null;
    setFieldValue(field.name, value);
    if (onChange) onChange(value);
  };

  const icon = <CalenderIcon />;
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Grid className={styles.DateTimePicker}>
        <KeyboardDateTimePicker
          className={styles.Text}
          error={hasError}
          autoOk
          variant={variant}
          inputVariant={inputVariant}
          format={format}
          data-testid="date-picker-inline"
          label={placeholder}
          value={dateValue}
          onChange={handleDateChange}
          helperText={hasError ? errorText : ''}
          minDate={minDate}
          keyboardIcon={icon}
        />
      </Grid>
    </MuiPickersUtilsProvider>
  );
};
