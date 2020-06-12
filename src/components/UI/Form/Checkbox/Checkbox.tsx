import React from 'react';
import { TextField } from '@material-ui/core';
import { Field } from 'formik';
import styles from './Input.module.css';

export interface InputElementProps {
  type?: any;
  label: string;
  name: string;
}

export const Checkbox: React.SFC<InputElementProps> = (props) => {
  return (
    <div className={styles.Input}>
      <label className={styles.Label}>{props.label}</label>
      <Field component={TextField} name={props.name} type={props.type} />
    </div>
  );
};
