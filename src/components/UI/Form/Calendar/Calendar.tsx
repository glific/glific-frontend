import { useState } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { getIn } from 'formik';
import { Dayjs } from 'dayjs';
import styles from './Calendar.module.css';
import { MONTH_DATE_FORMAT } from 'common/constants';

export interface CalendarProps {
  variant?: any;
  inputVariant?: any;
  format?: string;
  field: any;
  disabled?: boolean;
  form: { dirty: any; touched: any; errors: any; setFieldValue: any };
  placeholder: string;
  minDate?: any;
  className?: string;
}
const CalendarStyles = {
  '.MuiPickersOutlinedInput-root': {
    borderRadius: '12px',
    borderWidth: '2px',
  },
};

export const Calendar = ({
  format = MONTH_DATE_FORMAT,
  field,
  disabled = false,
  form: { setFieldValue, errors, touched },
  placeholder,
  minDate,
  className,
}: CalendarProps) => {
  const errorText = getIn(errors, field.name);
  const touchedVal = getIn(touched, field.name);
  const hasError = touchedVal && errorText !== undefined;
  const dateValue = field.value ? field.value : null;
  const [open, setOpen] = useState(false);

  const handleDateChange = (date: Dayjs | null | string) => {
    if (date) {
      if (date.toString() !== 'Invalid Date') {
        setFieldValue(field.name, date);
      }
    } else {
      setFieldValue(field.name, null);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={styles.Calendar} data-testid="date-picker-inline">
        <DatePicker
          label={placeholder}
          open={open}
          value={dateValue}
          format={format}
          onChange={handleDateChange}
          className={`${styles.CalendarInput} ${className}`}
          disabled={disabled}
          minDate={minDate}
          slotProps={{
            textField: {
              inputProps: {
                className: styles.Input,
                'data-testid': placeholder,
              },
              InputLabelProps: {
                className: styles.Label,
              },
              helperText: hasError ? errorText : '',
              error: hasError,
              onClick: () => !disabled && setOpen(true),
            },
          }}
          onClose={() => setOpen(false)}
          sx={CalendarStyles}
        />
      </div>
    </LocalizationProvider>
  );
};
