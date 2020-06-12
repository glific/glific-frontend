import React from 'react';
import { TextField } from '@material-ui/core';
import styles from './Checkbox.module.css';
import Checkbox from '@material-ui/core/Checkbox';

export interface CheckboxElementProps {
  type?: any;
  field: any;

  label: string;
  form: any;
}

export const CheckboxElement: React.SFC<CheckboxElementProps> = (props) => {
  return (
    <div className={styles.Input}>
      <label className={styles.Label}>{props.label}</label>
      <Checkbox {...props.field} />
    </div>
  );
};
