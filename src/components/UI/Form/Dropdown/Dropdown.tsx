import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { Select, FormControl, InputLabel, FormHelperText } from '@material-ui/core';

import styles from './Dropdown.module.css';

export interface DropdownProps {
  type?: any;
  field?: any;
  options: any;
  label: string;
  form?: any;
  placeholder: string;
  helperText?: string;
  disabled?: boolean;
  validate?: any;
}

export const Dropdown: React.SFC<DropdownProps> = (props) => {
  const { options, placeholder, field, helperText, disabled, form } = props;

  const optionsList = options
    ? options.map((option: any) => {
        return (
          <MenuItem value={option.id} key={option.id}>
            {option.label ? option.label : option.name}
          </MenuItem>
        );
      })
    : null;
  return (
    <div className={styles.Dropdown} data-testid="dropdown">
      <FormControl
        variant="outlined"
        fullWidth
        error={form.errors[field.name] && form.touched[field.name]}
      >
        {placeholder ? (
          <InputLabel id="simple-select-outlined-label" data-testid="inputLabel">
            {placeholder}
          </InputLabel>
        ) : null}
        <Select {...field} label={placeholder} fullWidth disabled={disabled}>
          {optionsList}
        </Select>
        {form.errors[field.name] && form.touched[field.name] ? (
          <FormHelperText>{form && form.errors[field.name]}</FormHelperText>
        ) : null}
        {helperText ? (
          <FormHelperText className={styles.HelperText}>{helperText}</FormHelperText>
        ) : null}
      </FormControl>
    </div>
  );
};
