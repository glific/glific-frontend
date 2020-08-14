import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import styles from './Dropdown.module.css';
import { Select, FormControl, InputLabel, FormHelperText } from '@material-ui/core';

export interface DropdownProps {
  type?: any;
  field: any;
  options: any;
  label: string;
  form: any;
  placeholder: string;
  helperText: string;
}

export const Dropdown: React.SFC<DropdownProps> = (props) => {
  const options = props.options
    ? props.options.map((option: any) => {
        return (
          <MenuItem value={option.id} key={option.id}>
            {option.label}
          </MenuItem>
        );
      })
    : null;
  return (
    <div className={styles.Dropdown}>
      <FormControl variant="outlined" fullWidth>
        {props.placeholder ? (
          <InputLabel id="simple-select-outlined-label">{props.placeholder}</InputLabel>
        ) : null}
        <Select {...props.field} label={props.placeholder} fullWidth>
          {options}
        </Select>
        {props.helperText ? (
          <FormHelperText className={styles.HelperText}>{props.helperText}</FormHelperText>
        ) : null}
      </FormControl>
    </div>
  );
};
