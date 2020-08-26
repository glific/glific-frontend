import React from 'react';
import styles from './Checkbox.module.css';
import { Checkbox as CheckboxElement } from '@material-ui/core';

export interface CheckboxProps {
  field: any;
  label: string;
  form: any;
  handleChange?: Function;
}

export const Checkbox: React.SFC<CheckboxProps> = (props) => {
  const handleDateChange = () => {
    props.form.setFieldValue(props.field.name, !props.field.value);
    if (props.handleChange) props.handleChange(!props.field.value);
  };

  return (
    <div className={styles.Checkbox}>
      <label className={styles.Label}>{props.label}</label>
      <CheckboxElement
        className={styles.CheckboxColor}
        {...props.field}
        labelPlacement="end"
        color="primary"
        checked={props.field.value}
        onChange={handleDateChange}
      />
    </div>
  );
};
