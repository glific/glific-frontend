import React from 'react';
import styles from './TimePicker.module.css';
import 'date-fns';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardTimePicker } from '@material-ui/pickers';
import { getIn } from 'formik';
import moment from 'moment';

export interface TimePickerProps {
  variant?: any;
  inputVariant?: any;
  field: any;
  form: { dirty: any; touched: any; errors: any; setFieldValue: any };
  placeholder: string;
  disabled?: boolean;
}

export const TimePicker: React.SFC<TimePickerProps> = ({
  variant = 'inline',
  inputVariant = 'outlined',
  field,
  form: { dirty, touched, errors, setFieldValue },
  placeholder,
  disabled = false,
}) => {
  const errorText = getIn(errors, field.name);
  const touchedVal = getIn(touched, field.name);
  const hasError = dirty && touchedVal && errorText !== undefined;
  moment.defaultFormat = 'Thh:mm:ss';
  const dateValue = field.value ? moment(field.value, moment.defaultFormat).toDate() : null;

  const handleDateChange = (time: Date | null) => {
    if (time) {
      setFieldValue(field.name, moment(time).format('THH:mm:ss'));
    }
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Grid className={styles.TimePicker}>
        <KeyboardTimePicker
          autoOk
          variant={variant}
          inputVariant={inputVariant}
          label={placeholder}
          data-testid="time-picker"
          mask="__:__ _M"
          value={dateValue}
          disabled={disabled}
          onChange={(date) => handleDateChange(date)}
        />
      </Grid>
    </MuiPickersUtilsProvider>
  );
};
