import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Chip, FormHelperText, FormControl, Checkbox } from '@material-ui/core';
import { getIn } from 'formik';
import styles from './AutoComplete.module.css';
import { ReactComponent as DeleteIcon } from '../../../../assets/images/icons/Close.svg';

export interface AutocompleteProps {
  options: any;
  optionLabel: string;
  field: any;
  icon?: any;
  form: { dirty?: any; touched?: any; errors?: any; setFieldValue: any };
  textFieldProps?: any;
  helperText?: string;
  multiple?: boolean;
  disabled?: boolean;
  chipIcon?: any;
}

export const AutoComplete: React.SFC<AutocompleteProps> = ({
  options,
  optionLabel,
  field,
  icon,
  chipIcon,
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
      <FormControl fullWidth error={errors && touched && errors[field.name] && touched[field.name]}>
        <Autocomplete
          multiple={multiple}
          data-testid="autocomplete-element"
          options={optionValue}
          getOptionLabel={(option: any) => (option[optionLabel] ? option[optionLabel] : '')}
          onChange={(event, value: any) => {
            setFieldValue(field.name, value);
          }}
          value={
            multiple
              ? optionValue.filter((option: any) =>
                  field.value.map((value: any) => value.id).includes(option.id)
                )
              : field.value
          }
          disabled={disabled}
          disableCloseOnSelect
          renderTags={(value: any, getTagProps) =>
            value.map((option: any, index: number) => (
              <Chip
                data-testid="searchChip"
                style={{ backgroundColor: '#e2f1ea' }}
                className={styles.Chip}
                icon={chipIcon}
                label={option[optionLabel]}
                {...getTagProps({ index })}
                deleteIcon={<DeleteIcon className={styles.DeleteIcon} data-testid="deleteIcon" />}
              />
            ))
          }
          renderOption={(option, { selected }) => (
            <React.Fragment>
              {multiple ? <Checkbox icon={icon} checked={selected} color="primary" /> : ''}
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
