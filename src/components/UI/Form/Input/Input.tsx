import React from 'react';
import { FormControl, OutlinedInput, FormHelperText, InputLabel } from '@material-ui/core';

import styles from './Input.module.css';

export interface InputProps {
  type?: any;
  field: any;

  label: string;
  form: any;
  placeholder: any;
  rows: number;
}

export const Input: React.SFC<InputProps> = (props) => {
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
          error={error[name] && touched[name] ? true : false}
          classes={{
            notchedOutline: styles.InputBorder,
          }}
          multiline={true}
          rows={props.rows}
          label={props.placeholder}
          fullWidth
          {...props.field}
        ></OutlinedInput>
        {error[name] && touched[name] ? <FormHelperText>Required</FormHelperText> : null}
      </FormControl>
    </div>
  );
};
