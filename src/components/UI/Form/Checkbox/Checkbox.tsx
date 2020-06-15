import React from 'react';
import styles from './Checkbox.module.css';
import { Checkbox as CheckboxElement } from '@material-ui/core';

export interface CheckboxProps {
  type?: any;
  field: any;

  label: string;
  form: any;
}

export const Checkbox: React.SFC<CheckboxProps> = (props) => {
  return (
    <div className={styles.Checkbox}>
      <label className={styles.Label}>{props.label}</label>
      <CheckboxElement {...props.field} />
    </div>
  );
};
