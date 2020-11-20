import React from 'react';
import { Checkbox as CheckboxElement, FormControlLabel } from '@material-ui/core';

import styles from './Checkbox.module.css';

export interface CheckboxProps {
  field: any;
  title: string;
  form: any;
  handleChange?: Function;
}

export const Checkbox: React.SFC<CheckboxProps> = (props) => {
  const { field, title } = props;
  const handleChange = () => {
    props.form.setFieldValue(props.field.name, !props.field.value);
    if (props.handleChange) props.handleChange(!props.field.value);
  };

  return (
    <div className={styles.Checkbox}>
      <FormControlLabel
        control={
          <CheckboxElement
            data-testid="checkboxLabel"
            className={styles.CheckboxColor}
            {...field}
            color="primary"
            checked={field.value ? field.value : false}
            onChange={handleChange}
          />
        }
        labelPlacement="end"
        label={title}
      />
    </div>
  );
};
