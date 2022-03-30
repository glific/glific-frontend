import React, { useState } from 'react';
import 'date-fns';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardTimePicker } from '@material-ui/pickers';
import moment from 'moment';
import { getIn } from 'formik';
import ScheduleIcon from '@material-ui/icons/Schedule';

import styles from './TimePicker.module.css';

export interface TimePickerProps {
  variant?: any;
  inputVariant?: any;
  field: any;
  form: { dirty: any; touched: any; errors: any; setFieldValue: any };
  placeholder: string;
  disabled?: boolean;
  helperText?: string;
}

export const TimePicker: React.SFC<TimePickerProps> = ({
  variant = 'inline',
  inputVariant = 'outlined',
  field,
  form: { setFieldValue, touched, errors },
  placeholder,
  disabled = false,
  helperText,
}) => {
  moment.defaultFormat = 'Thh:mm:ss';
  const dateValue = field.value ? moment(field.value, moment.defaultFormat).toDate() : null;
  const [open, setOpen] = useState(false);

  const errorText = getIn(errors, field.name);
  const touchedVal = getIn(touched, field.name);
  const hasError = touchedVal && errorText !== undefined;

  const handleDateChange = (time: Date | null) => {
    const value = time ? moment(time).format('THH:mm:ss') : null;
    setFieldValue(field.name, value);
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Grid className={styles.TimePicker}>
        <KeyboardTimePicker
          error={hasError}
          autoOk
          open={open}
          variant={variant}
          inputVariant={inputVariant}
          label={placeholder}
          data-testid="time-picker"
          mask="__:__ _M"
          value={dateValue}
          onClick={() => !disabled && setOpen(true)}
          onClose={() => setOpen(false)}
          disabled={disabled}
          onChange={(date) => handleDateChange(date)}
          keyboardIcon={<ScheduleIcon />}
          helperText={hasError ? errorText : ''}
          className={styles.picker}
        />
        {helperText && (
          <div id="helper-text" className={styles.HelperText}>
            {helperText}
          </div>
        )}
      </Grid>
    </MuiPickersUtilsProvider>
  );
};
