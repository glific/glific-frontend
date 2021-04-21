import React from 'react';
import { FormControl, OutlinedInput, FormHelperText, InputLabel } from '@material-ui/core';

import styles from './InputURL.module.css';

export interface InputURLProps {
  type?: any;
  field: { name: string; onChange: any; value: any };
  disabled?: any;
  form?: { touched: any; errors: any };
  placeholder: any;
  validate?: any;
  inputProp?: any;
}

export const InputURL: React.SFC<InputURLProps> = ({ ...props }) => {
  const { type = 'text', field, disabled, form, placeholder, inputProp } = props;

  return (
    <div className={styles.Input} data-testid="input">
      www.
      <FormControl fullWidth error={form && form.errors[field.name] && form.touched[field.name]}>
        <InputLabel variant="outlined" className={styles.Label} data-testid="inputLabel">
          {placeholder}
        </InputLabel>
        <OutlinedInput
          data-testid="outlinedInput"
          inputProps={inputProp}
          type={type}
          disabled={disabled}
          error={form && form.errors[field.name] && form.touched[field.name]}
          className={styles.OutlineInput}
          label={placeholder}
          fullWidth
          {...field}
        />
        {form && form.errors[field.name] && form.touched[field.name] ? (
          <FormHelperText className={styles.DangerText}>{form.errors[field.name]}</FormHelperText>
        ) : null}
      </FormControl>
      .tides.coloredcow.com
    </div>
  );
};
