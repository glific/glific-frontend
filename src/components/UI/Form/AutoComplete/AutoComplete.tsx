import { useEffect, useState } from 'react';
import {
  Autocomplete,
  TextField,
  Chip,
  FormHelperText,
  FormControl,
  Checkbox,
} from '@mui/material';

import { getIn } from 'formik';

import DeleteIcon from 'assets/images/icons/Close.svg?react';
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
  openOptions?: boolean;
  disableClearable?: boolean;
  listBoxProps?: any;
  classes?: any;
  renderTags?: boolean;
  selectedOptionsIds?: any;
  selectTextAsOption?: boolean;
  onInputChange?: any;
  valueElementName?: string;
  placeholder?: string;
  hasCreateOption?: boolean;
  handleCreateItem?: any;
  isFilterType?: boolean;
}

export const AutoComplete = ({
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
  hasCreateOption = false,
  handleCreateItem = () => {},
  placeholder = '',
  isFilterType = false,
}: AutocompleteProps) => {
  const errorText = getIn(errors, field.name);
  const touchedVal = getIn(touched, field.name);
  const hasError = touchedVal && errorText !== undefined;
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [optionValue, setOptionValue] = useState([]);
  const [open, setOpen] = useState(false);

  const inputSxStyle = {
    '& .MuiOutlinedInput-root': {
      height: '100%',
      paddingBottom: 0,
      paddingTop: 0,
    },
    '& fieldset': {
      borderRadius: '12px',
      border: 'none',
    },
    height: '100%',
    borderRadius: '10px !important',
    borderColor: '#93a29b',
    borderWidth: '2px',
    borderStyle: 'solid',
    padding: 0,
    marginLeft: '8px',
  };

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
  const createOption = {
    label: `${inputValue} `,
    inputValue,
  };

  const getOptionDisabled = (option: any) => selectedOptionsIds.includes(option.id);

  return (
    <div className={styles.Input}>
      <FormControl fullWidth error={hasError}>
        {questionText ? <div className={styles.QuestionText}>{questionText}</div> : null}
        <Autocomplete
          classes={classes}
          sx={isFilterType ? { height: '48px' } : {}}
          multiple={multiple}
          data-testid="autocomplete-element"
          options={hasCreateOption ? [...optionValue, createOption] : optionValue}
          freeSolo={freeSolo}
          autoSelect={autoSelect}
          disableClearable={disableClearable}
          getOptionLabel={(option: any) =>
            option[optionLabel] != null ? option[optionLabel] : option
          }
          getOptionDisabled={getOptionDisabled}
          isOptionEqualToValue={(option, value) => {
            if (value) {
              return option[valueElementName] === value[valueElementName];
            }
            return false;
          }}
          onChange={(_event, value: any) => {
            if (asyncSearch && value.length > 0) {
              asyncValues.setValue([...value]);
              setSearchTerm('');
              onChange('');
            } else if (asyncSearch && value.length === 0) {
              asyncValues.setValue([]);
            }
            if (onChange) {
              onChange(value);
            }
            if (value && value.inputValue) {
              handleCreateItem(value.inputValue).then((value: any) =>
                setFieldValue(field.name, value)
              );
            } else {
              setFieldValue(field.name, value);
            }
          }}
          onInputChange={
            hasCreateOption
              ? (_event, newInputValue) => {
                  setInputValue(newInputValue);
                }
              : onInputChange
          }
          inputValue={asyncSearch ? searchTerm : undefined}
          value={getValue}
          disabled={disabled}
          disableCloseOnSelect={multiple}
          renderTags={getRenderTags}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              {multiple && (
                <Checkbox
                  icon={icon}
                  checked={
                    asyncSearch
                      ? asyncValues.value.map((value: any) => value.id).includes(option.id)
                      : selected
                  }
                  color="primary"
                />
              )}
              {option.inputValue ? <>Create "{option.inputValue}"</> : getLabel(option)}
            </li>
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
                placeholder={placeholder}
                sx={isFilterType ? inputSxStyle : {}}
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
        {helperText && <FormHelperText className={styles.HelperText}>{helperText}</FormHelperText>}

        {helpLink && (
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
        )}
      </FormControl>
    </div>
  );
};
