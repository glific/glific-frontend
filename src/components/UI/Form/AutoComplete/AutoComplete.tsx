import React from 'react';
import styles from './AutoComplete.module.css';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Chip } from '@material-ui/core';
import { getIn } from 'formik';

export interface AutocompleteProps {
  options: any;
  optionLabel: string;
  label: string;
  field: any;
  icon?: any;
  form: { dirty: any; touched: any; errors: any; setFieldValue: any };
  textFieldProps?: any;
}

export const AutoComplete: React.SFC<AutocompleteProps> = ({
  options,
  optionLabel,
  label,
  field,
  icon,
  form: { dirty, touched, errors, setFieldValue },
  textFieldProps,
}) => {
  const errorText = getIn(errors, field.name);
  const touchedVal = getIn(touched, field.name);
  const hasError = dirty && touchedVal && errorText !== undefined;
  const optionValue = options.length > 0 ? options : [];

  return (
    <Autocomplete
      className={styles.Input}
      multiple
      id="checkboxes-tags-demo"
      options={optionValue}
      getOptionLabel={(option: any) => option[optionLabel]}
      onChange={(event, Value: any) => {
        if (Value) {
          setFieldValue(field.name, Value);
        }
      }}
      value={field.value}
      freeSolo
      renderTags={(value: any, getTagProps) =>
        value.map((option: any, index: number) => (
          <Chip
            style={{ backgroundColor: '#e2f1ea' }}
            className={styles.Chip}
            icon={icon}
            label={option[optionLabel]}
            {...getTagProps({ index })}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          error={hasError}
          helperText={hasError ? errorText : ''}
          {...textFieldProps}
        />
      )}
    />
  );
};
