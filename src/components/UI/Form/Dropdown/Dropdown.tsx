import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import styles from './Dropdown.module.css';
import Select from '@material-ui/core/Select';

export interface DropdownProps {
  type?: any;
  field: any;
  options: any;
  label: string;
  form: any;
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
      <label className={styles.Label}>{props.label}</label>
      <Select {...props.field}>{options}</Select>
    </div>
  );
};
