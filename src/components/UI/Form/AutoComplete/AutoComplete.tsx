import React from 'react';
import styles from './AutoComplete.module.css';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { Chip } from '@material-ui/core';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" color="secondary" />;

export interface AutocompleteProps {
  options: any;
  optionLabel: string;
  label: string;
  form?: any;
  icon?: any;
}

export const AutoComplete: React.SFC<AutocompleteProps> = (props) => {
  const optionValue = props.options.length > 0 ? props.options : [];

  return (
    <Autocomplete
      className={styles.Input}
      multiple
      id="checkboxes-tags-demo"
      options={optionValue.map((option: any) => option[props.optionLabel])}
      freeSolo
      renderTags={(value: string[], getTagProps) =>
        value.map((option: string, index: number) => (
          <Chip
            style={{ backgroundColor: '#e2f1ea' }}
            className={styles.Chip}
            icon={props.icon}
            label={option}
            {...getTagProps({ index })}
          />
        ))
      }
      renderInput={(params) => <TextField {...params} variant="outlined" label={props.label} />}
    />
  );
};
