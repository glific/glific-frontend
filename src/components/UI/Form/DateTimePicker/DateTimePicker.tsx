import { LocalizationProvider, DateTimePicker as Picker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'
import { getIn } from 'formik';

import styles from './DateTimePicker.module.css';
dayjs.extend(utc)

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

export const DateTimePicker = ({
  format = 'DD/MM/YYYY hh:mm a',
  field,
  form: { setFieldValue, errors, touched },
  placeholder,
  minDate,
  onChange,
}: DateTimePickerProps) => {
  const errorText = getIn(errors, field.name);
  const touchedVal = getIn(touched, field.name);
  const hasError = touchedVal && errorText !== undefined;
  const dateValue = field.value ? (field.value) : null;  

  const handleDateChange = (date: Date | null | string) => {
    const value = date && date.toString() !== 'Invalid Date' ? dayjs(date) : null;
    setFieldValue(field.name, value);
    if (onChange) onChange(value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={styles.DateTimePicker} data-testid="date-picker-inline">
        <Picker
          className={styles.Text}
          label={placeholder}
          timezone='system'
          format={format}
          value={dateValue}
          slotProps={{
            textField: {
              helperText: hasError ? errorText : '',
              error: hasError,
            },
          }}
          onChange={handleDateChange}
          minDate={minDate}
        />
      </div>
    </LocalizationProvider>
  );
};