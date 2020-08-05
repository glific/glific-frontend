import React from 'react';
import styles from './PhoneInput.module.css';
import { FormControl, FormHelperText } from '@material-ui/core';
import ReactPhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/bootstrap.css';

export interface InputProps {
  inputClass?: string;
  value?: string;
  enableSearch?: boolean;
  inputProps?: object;
  onChange: any;
  error: boolean;
  helperText: string;
}

export const PhoneInput: React.SFC<InputProps> = ({ ...props }) => {
  const onChange = props.onChange;
  const error = props.error;

  return (
    <div className={styles.Input}>
      <FormControl>
        <ReactPhoneInput
          inputClass={styles.PhoneNumber}
          data-testid="phoneNumber"
          placeholder="Your phone number"
          enableSearch={true}
          country={'in'}
          inputProps={{
            label: 'Your phone number',
            name: 'tel',
            required: true,
            autoFocus: false,
          }}
          onChange={onChange}
        />
        {error ? (
          <FormHelperText classes={{ root: styles.FormHelperText }}>
            {props.helperText}
          </FormHelperText>
        ) : null}
      </FormControl>
    </div>
  );
};

export default PhoneInput;
