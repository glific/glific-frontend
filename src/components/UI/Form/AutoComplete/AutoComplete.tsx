import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Chip, FormHelperText, FormControl, Checkbox } from '@material-ui/core';
import { getIn } from 'formik';
import styles from './AutoComplete.module.css';

export interface AutocompleteProps {
  options: any;
  optionLabel: string;
  field: any;
  icon?: any;
  form: { dirty: any; touched: any; errors: any; setFieldValue: any };
  textFieldProps?: any;
  helperText?: string;
  multiple?: boolean;
  disabled?: boolean;
}

export const AutoComplete: React.SFC<AutocompleteProps> = ({
  options,
  optionLabel,
  field,
  icon,
  form: { dirty, touched, errors, setFieldValue },
  textFieldProps,
  helperText,
  multiple = true,
  disabled = false,
}) => {
  const errorText = getIn(errors, field.name);
  const touchedVal = getIn(touched, field.name);
  const hasError = dirty && touchedVal && errorText !== undefined;
  const optionValue = options.length > 0 ? options : [];

  return (
    <div className={styles.Input}>
      <FormControl fullWidth error={errors[field.name] && touched[field.name] ? true : false}>
        <Autocomplete
          multiple={multiple}
          data-testid="autocomplete-element"
          options={optionValue}
          getOptionLabel={(option: any) => option[optionLabel]}
          onChange={(event, value: any) => {
            if (value) {
              setFieldValue(field.name, value);
            }
          }}
          value={
            multiple
              ? optionValue.filter((option: any) =>
                  field.value.map((value: any) => value.id).includes(option.id)
                )
              : field.value
          }
          disabled={disabled}
          freeSolo
          disableCloseOnSelect
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
          renderOption={(option, { selected }) => (
            <React.Fragment>
              <Checkbox icon={icon} checked={selected} />
              {option[optionLabel]}
            </React.Fragment>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              error={hasError}
              helperText={hasError ? errorText : ''}
              {...textFieldProps}
            />
          )}
        />
        {helperText ? (
          <FormHelperText className={styles.HelperText}>{helperText}</FormHelperText>
        ) : null}
      </FormControl>
    </div>
  );
};
