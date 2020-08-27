import React from 'react';
import styles from './Checkbox.module.css';
import { Checkbox as CheckboxElement, FormControlLabel } from '@material-ui/core';

export interface CheckboxProps {
  field: any;
  fieldLabel: string;
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
      <FormControlLabel
        control={
          <CheckboxElement
            className={styles.CheckboxColor}
            {...props.field}
            color="primary"
            checked={props.field.value}
            onChange={handleDateChange}
          />
        }
        labelPlacement="end"
        label={props.fieldLabel}
        data-testid="checkboxLabel"
      />
    </div>
  );
};
