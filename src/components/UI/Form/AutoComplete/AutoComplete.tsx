import React, { useEffect, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Chip, FormHelperText, FormControl, Checkbox } from '@material-ui/core';
import { getIn } from 'formik';

import { ReactComponent as DeleteIcon } from 'assets/images/icons/Close.svg';
import styles from './AutoComplete.module.css';

export interface AutocompleteProps {
  options: any;
  optionLabel: string;
  additionalOptionLabel?: string;
  field: any;
  icon?: any;
  freeSolo?: boolean;
  autoSelect?: boolean;
  form: { dirty?: any; touched?: any; errors?: any; setFieldValue: any };
  textFieldProps?: any;
  helperText?: any;
  questionText?: any;
  multiple?: boolean;
  disabled?: boolean;
  helpLink?: any;
  chipIcon?: any;
  getOptions?: any;
  validate?: any;
  asyncValues?: any;
  noOptionsText?: any;
  onChange?: any;
  asyncSearch?: boolean;
  roleSelection?: any;
  openOptions?: boolean;
  disableClearable?: boolean;
  listBoxProps?: any;
  classes?: any;
  renderTags?: boolean;
  selectedOptionsIds?: any;
  selectTextAsOption?: boolean;
  onInputChange?: any;
  valueElementName?: string;
}

export const AutoComplete: React.SFC<AutocompleteProps> = ({
  options,
  optionLabel,
  additionalOptionLabel,
  field,
  icon,
  chipIcon,
  form: { touched, errors, setFieldValue },
  textFieldProps,
  helperText,
  questionText,
  multiple = true,
  disabled = false,
  freeSolo = false,
  autoSelect = false,
  getOptions,
  asyncValues,
  roleSelection,
  onChange,
  asyncSearch = false,
  helpLink,
  noOptionsText = 'No options available',
  openOptions,
  disableClearable = false,
  listBoxProps,
  classes = {},
  renderTags = true,
  selectedOptionsIds = [],
  selectTextAsOption = false,
  onInputChange = () => null,
  valueElementName = 'id',
}) => {
  const errorText = getIn(errors, field.name);
  const touchedVal = getIn(touched, field.name);
  const hasError = touchedVal && errorText !== undefined;
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

  const getValue = (() => {
    if (multiple && asyncSearch) return asyncValues.value;
    if (multiple) {
      if (optionValue.length > 0 && field.value) {
        return optionValue.filter((option: any) =>
          field.value.map((value: any) => value.id).includes(option.id)
        );
      }
      return [];
    }
    return field.value;
  })();

  const getLabel = (option: any) => {
    if (option[optionLabel]) {
      return option[optionLabel];
    }
    if (additionalOptionLabel) {
      return option[additionalOptionLabel];
    }
    return option;
  };

  /**
   *
   * @param value Callback value
   * @param getTagProps Render tag props
   *
   */
  const getRenderTags = (value: Array<any>, getTagProps: any) => {
    let tagsToRender = value;

    /**
     * when renderTags is true,
     * default selected options along with newly selected options will be visible
     * else,
     * only post selected options will be visible

     */
    if (!renderTags) {
      tagsToRender = value.filter((option: any) => !selectedOptionsIds.includes(option.id));
    }

    return tagsToRender.map((option: any, index: number) => {
      const props = getTagProps({ index });

      /**
       * If disableClearable is true, removing onDelete event
       * deleteIcon component will be disabled, when onDelete is absent
       */
      if (disableClearable) {
        delete props.onDelete;
      }

      return (
        <Chip
          data-testid="searchChip"
          style={{ backgroundColor: '#e2f1ea' }}
          className={styles.Chip}
          icon={chipIcon}
          label={getLabel(option)}
          {...props}
          deleteIcon={<DeleteIcon className={styles.DeleteIcon} data-testid="deleteIcon" />}
        />
      );
    });
  };

  const getOptionDisabled = (option: any) => selectedOptionsIds.includes(option.id);

  return (
    <div className={styles.Input}>
      <FormControl fullWidth error={hasError}>
        {questionText ? <div className={styles.QuestionText}>{questionText}</div> : null}
        <Autocomplete
          classes={classes}
          multiple={multiple}
          data-testid="autocomplete-element"
          options={optionValue}
          freeSolo={freeSolo}
          autoSelect={autoSelect}
          disableClearable={disableClearable}
          getOptionLabel={(option: any) => (option[optionLabel] ? option[optionLabel] : option)}
          getOptionDisabled={getOptionDisabled}
          getOptionSelected={(option, value) =>
            option[valueElementName] === value[valueElementName]
          }
          onChange={(event, value: any) => {
            if (roleSelection) {
              roleSelection(value);
            }
            if (asyncSearch && value.length > 0) {
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
            } else if (asyncSearch && value.length === 0) {
              asyncValues.setValue([]);
            }
            if (onChange) {
              onChange(value);
            }
            setFieldValue(field.name, value);
          }}
          onInputChange={onInputChange}
          inputValue={asyncSearch ? searchTerm : undefined}
          value={getValue}
          disabled={disabled}
          disableCloseOnSelect={multiple}
          renderTags={getRenderTags}
          renderOption={(option: any, { selected }) => (
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
              {getLabel(option)}
            </>
          )}
          renderInput={(params: any) => {
            const { inputProps } = params;
            inputProps.value = selectTextAsOption ? field.value : inputProps.value;
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
                inputProps={inputProps}
                {...asyncChange}
                error={hasError}
                helperText={hasError ? errorText : ''}
                {...textFieldProps}
                data-testid="AutocompleteInput"
              />
            );
          }}
          open={openOptions || open}
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
          }}
          noOptionsText={noOptionsText}
          ListboxProps={listBoxProps}
        />
        {helperText ? (
          <FormHelperText className={styles.HelperText}>{helperText}</FormHelperText>
        ) : null}

        {helpLink ? (
          <div
            className={styles.HelpLink}
            onKeyDown={() => helpLink.handleClick()}
            onClick={() => helpLink.handleClick()}
            role="button"
            data-testid="helpButton"
            tabIndex={0}
          >
            {helpLink.label}
          </div>
        ) : null}
      </FormControl>
    </div>
  );
};
