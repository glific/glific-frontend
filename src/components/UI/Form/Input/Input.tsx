import React from 'react';
import { TextField } from '@material-ui/core';

import styles from './Input.module.css';

export interface InputElementProps {
  type?: any;
  field: any;

  label: string;
  form: any;
}

export const Input: React.SFC<InputElementProps> = (props) => {
  const touched = props.form.touched;
  const error = props.form.errors;
  const name = props.field.name;
  return (
    <div className={styles.Input}>
      <label className={styles.Label}>{props.label}</label>
      <TextField
        error={error[name] && touched[name] ? true : false}
        helperText={touched[name] ? error[name] : null}
        {...props.field}
      />
    </div>
  );
};
