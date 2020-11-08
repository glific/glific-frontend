import React, { useEffect, useState } from 'react';
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
  getOptions?: any;
  validate?: any;
  asyncValues?: any;
  noOptionsText?: any;
  onChange?: any;
  asyncSearch?: boolean;
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
  getOptions,
  asyncValues,
  onChange,
  asyncSearch = false,
  noOptionsText = 'No options available',
}) => {
  const errorText = getIn(errors, field.name);
  const touchedVal = getIn(touched, field.name);
  const hasError = dirty && touchedVal && errorText !== undefined;
  const [searchTerm, setSearchTerm] = useState('');
  const [optionValue, setOptionValue] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (options.length > 0) {
      setOptionValue(options);
    }
  }, [options]);

  useEffect(() => {
    if (getOptions && getOptions()) {
      const optionList = getOptions();
      if (optionList.length > 0) setOptionValue(optionList);
    }
  }, [open, getOptions]);

  return (
    <div className={styles.Input}>
      <FormControl fullWidth error={errors && touched && errors[field.name] && touched[field.name]}>
        <Autocomplete
          multiple={multiple}
          data-testid="autocomplete-element"
          options={optionValue}
          getOptionLabel={(option: any) => (option[optionLabel] ? option[optionLabel] : '')}
          onChange={(event, value: any) => {
            if (asyncSearch) {
              const filterValues = asyncValues.value.filter(
                (val: any) => val.id !== value[value.length - 1].id
              );
              if (filterValues.length === value.length - 2) {
                asyncValues.setValue(filterValues);
              } else {
                asyncValues.setValue([...value]);
              }
              setSearchTerm('');
              onChange('');
            }
            setFieldValue(field.name, value);
          }}
          inputValue={asyncSearch ? searchTerm : undefined}
          value={
            multiple
              ? asyncSearch
                ? asyncValues.value
                : optionValue.filter((option: any) =>
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
          renderOption={(option, { selected }) => {
            return (
              <>
                {multiple ? (
                  <Checkbox
                    icon={icon}
                    checked={
                      asyncSearch
                        ? asyncValues.value.map((value: any) => value.id).includes(option.id)
                        : selected
                    }
                    color="primary"
                  />
                ) : (
                  ''
                )}
                {option[optionLabel]}
              </>
            );
          }}
          renderInput={(params: any) => {
            const asyncChange = asyncSearch
              ? {
                  onChange: (event: any) => {
                    setSearchTerm(event.target.value);
                    return onChange(event.target.value);
                  },
                }
              : null;
            return (
              <TextField
                {...params}
                {...asyncChange}
                error={hasError}
                helperText={hasError ? errorText : ''}
                {...textFieldProps}
                data-testid="AutocompleteInput"
              />
            );
          }}
          open={open}
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
          }}
          noOptionsText={noOptionsText}
        />
        {helperText ? (
          <FormHelperText className={styles.HelperText}>{helperText}</FormHelperText>
        ) : null}
      </FormControl>
    </div>
  );
};
