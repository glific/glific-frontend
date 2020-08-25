import React from 'react';
import styles from './Checkbox.module.css';
import { Checkbox as CheckboxElement, FormControlLabel } from '@material-ui/core';

export interface CheckboxProps {
  type?: any;
  field: any;
  title: string;
  form: any;
}

export const Checkbox: React.SFC<CheckboxProps> = (props) => {
  return (
    <div className={styles.Checkbox}>
      <FormControlLabel
        control={<CheckboxElement {...props.field} />}
        label={props.title}
        data-testid="checkboxLabel"
      />
    </div>
  );
};
