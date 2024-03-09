import { FormControl, FormHelperText } from '@mui/material';
import 'react-phone-input-2/lib/bootstrap.css';
import { getIn } from 'formik';
import ReactPhoneInput from 'react-phone-input-2';

import styles from './PhoneInput.module.css';

export interface InputProps {
  enableSearch?: boolean;
  inputProps?: {
    name: string;
    required: boolean;
    autoFocus: boolean;
  };
  helperText: string;
  field: any;
  placeholder: string;
  form: { touched: any; errors: any; setFieldValue: any };
}

export const PhoneInput = ({
  enableSearch = true,
  form: { touched, errors, setFieldValue },
  field,
  inputProps = {
    name: field.name,
    required: true,
    autoFocus: false,
  },
  placeholder,
}: InputProps) => {
  const errorText = getIn(errors, field.name);
  const touchedVal = getIn(touched, field.name);
  const hasError = touchedVal && errorText !== undefined;

  return (
    <div className={styles.Input} data-testid="phoneInput">
      <FormControl>
        <ReactPhoneInput
          containerClass={styles.Container}
          inputClass={styles.PhoneNumber}
          data-testid="phoneNumber"
          placeholder={placeholder}
          enableSearch={enableSearch}
          country="in"
          autoFormat={false}
          inputProps={inputProps}
          {...field}
          value={field.value}
          onChange={(event) => {
            setFieldValue(field.name, event);
          }}
        />
        {hasError ? (
          <FormHelperText classes={{ root: styles.FormHelperText }}>{errorText}</FormHelperText>
        ) : null}
      </FormControl>
    </div>
  );
};
