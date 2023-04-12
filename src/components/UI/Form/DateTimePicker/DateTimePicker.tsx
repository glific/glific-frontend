import { LocalizationProvider, DateTimePicker as Picker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import 'date-fns';
import { getIn } from 'formik';

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

export const DateTimePicker = ({
  format = 'dd/MM/yyyy hh:mm a',
  field,
  form: { setFieldValue, errors, touched },
  placeholder,
  minDate,
  onChange,
}: DateTimePickerProps) => {
  const errorText = getIn(errors, field.name);
  const touchedVal = getIn(touched, field.name);
  const hasError = touchedVal && errorText !== undefined;
  const dateValue = field.value ? field.value : null;

  const handleDateChange = (date: Date | null | string) => {
    const value = date && date.toString() !== 'Invalid Date' ? date : null;
    setFieldValue(field.name, value);
    if (onChange) onChange(value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className={styles.DateTimePicker} data-testid="date-picker-inline">
        <Picker
          className={styles.Text}
          label={placeholder}
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
