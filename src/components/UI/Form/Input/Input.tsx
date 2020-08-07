import React from 'react';
import { FormControl, OutlinedInput, FormHelperText, InputLabel } from '@material-ui/core';

import styles from './Input.module.css';

export interface InputProps {
  type?: any;
  field: any;
  disabled?: any;

  label: string;
  form: any;
  placeholder: any;
  rows: number;
  helperText?: string;
  emojiPicker?: boolean | null;
  textArea?: boolean;
}

export const Input: React.SFC<InputProps> = ({ textArea = false, disabled = false, ...props }) => {
  const touched = props.form.touched;
  const error = props.form.errors;
  const name = props.field.name;

  return (
    <div className={styles.Input}>
      <FormControl fullWidth error={error[name] && touched[name] ? true : false}>
        <InputLabel variant="outlined" className={styles.Label}>
          {props.placeholder}
        </InputLabel>
        <OutlinedInput
          classes={{ multiline: styles.Multiline }}
          disabled={disabled}
          error={error[name] && touched[name] ? true : false}
          multiline={textArea}
          rows={props.rows}
          label={props.placeholder}
          fullWidth
          {...props.field}
          endAdornment={props.emojiPicker ? props.emojiPicker : null}
        ></OutlinedInput>
        {error[name] && touched[name] ? <FormHelperText>{error[name]}</FormHelperText> : null}
        {props.helperText ? (
          <FormHelperText className={styles.HelperText}>{props.helperText}</FormHelperText>
        ) : null}
      </FormControl>
    </div>
  );
};
