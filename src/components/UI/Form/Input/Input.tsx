import React from 'react';
import { TextField } from '@material-ui/core';
import { Field } from 'formik';
import styles from './Input.module.css';
import { useField, withFormik } from 'formik';

export interface InputElementProps {
  type?: any;
  field: any;
  meta: any;
  helpers: any;
  Label: string;
  form: any;
}

export const Input: React.SFC<InputElementProps> = (props) => {
  console.log(props);
  const meta = props.meta.error;
  return (
    <div className={styles.Input}>
      <label className={styles.Label}>{props.Label}</label>
      <TextField error={meta ? true : false} helperText={meta} {...props.field} />
    </div>
  );
};
