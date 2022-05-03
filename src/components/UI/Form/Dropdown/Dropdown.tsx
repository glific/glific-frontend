import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { Select, FormControl, InputLabel, FormHelperText } from '@material-ui/core';

import styles from './Dropdown.module.css';

export interface DropdownProps {
  type?: any;
  field?: any;
  options: any;
  label?: string;
  form?: any;
  placeholder: string;
  helperText?: string;
  disabled?: boolean;
  validate?: any;
  fieldChange?: any;
  fieldValue?: any;
}

export const Dropdown = ({ options, placeholder, field, helperText, disabled, form, fieldValue, fieldChange }: DropdownProps) => {
  const { onChange, value, ...rest } = field;

  let optionsList = null;
  if (options) {
    optionsList = options.map((option: any) => (
      <MenuItem value={option.id} key={option.id}>
        {option.label ? option.label : option.name}
      </MenuItem>
    ));
  }

  return (
    <div className={styles.Dropdown} data-testid="dropdown">
      <FormControl
        variant="outlined"
        fullWidth
        error={form && form.errors[field.name] && form.touched[field.name]}
      >
        {placeholder ? (
          <InputLabel id="simple-select-outlined-label" data-testid="inputLabel">
            {placeholder}
          </InputLabel>
        ) : null}
        <Select
          onChange={(event) => {
            onChange(event);
            if (fieldChange) {
              fieldChange(event);
            }
          }}
          MenuProps={{
            classes: {
              paper: styles.Paper,
            },
          }}
          value={fieldValue !== undefined ? fieldValue : value}
          {...rest}
          label={placeholder !== '' ? placeholder : undefined}
          fullWidth
          disabled={disabled}
        >
          {optionsList}
        </Select>
        {form && form.errors[field.name] && form.touched[field.name] ? (
          <FormHelperText>{form.errors[field.name]}</FormHelperText>
        ) : null}
        {helperText ? (
          <FormHelperText className={styles.HelperText}>{helperText}</FormHelperText>
        ) : null}
      </FormControl>
    </div>
  );
};
