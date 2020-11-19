import React from 'react';
import 'date-fns';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardTimePicker } from '@material-ui/pickers';
import moment from 'moment';

import styles from './TimePicker.module.css';

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
  form: { setFieldValue },
  placeholder,
  disabled = false,
}) => {
  moment.defaultFormat = 'Thh:mm:ss';
  const dateValue = field.value ? moment(field.value, moment.defaultFormat).toDate() : null;

  const handleDateChange = (time: Date | null) => {
    const value = time ? moment(time).format('THH:mm:ss') : null;
    setFieldValue(field.name, value);
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
