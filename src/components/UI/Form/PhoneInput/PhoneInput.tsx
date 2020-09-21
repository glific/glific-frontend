import React from 'react';
import { FormControl, FormHelperText } from '@material-ui/core';
import ReactPhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/bootstrap.css';
import { getIn } from 'formik';
import styles from './PhoneInput.module.css';

export interface InputProps {
  enableSearch?: boolean;
  inputProps?: object;
  helperText: string;
  field: any;
  placeholder: string;
  form: { dirty: any; touched: any; errors: any; setFieldValue: any };
}

export const PhoneInput: React.SFC<InputProps> = ({
  enableSearch = true,
  form: { dirty, touched, errors, setFieldValue },
  field,
  inputProps = {
    required: true,
    autoFocus: false,
  },
  ...props
}) => {
  const errorText = getIn(errors, field.name);

  return (
    <div className={styles.Input}>
      <FormControl>
        <ReactPhoneInput
          containerClass={styles.Container}
          inputClass={styles.PhoneNumber}
          data-testid="phoneNumber"
          placeholder={props.placeholder}
          enableSearch={enableSearch}
          country={'in'}
          autoFormat={false}
          inputProps={inputProps}
          {...field}
          value={field.value}
          onChange={(event) => {
            setFieldValue(field.name, event);
          }}
        />
        {errorText ? (
          <FormHelperText classes={{ root: styles.FormHelperText }}>{errorText}</FormHelperText>
        ) : null}
      </FormControl>
    </div>
  );
};
