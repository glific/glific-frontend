import React, { useState, useEffect } from 'react';
import { FormControl } from '@material-ui/core';

import styles from './SearchDialogBox.module.css';
import { DialogBox } from '../DialogBox/DialogBox';
import { AutoComplete } from '../Form/AutoComplete/AutoComplete';

export interface SearchDialogBoxProps {
  title: string;
  handleOk: Function;
  handleCancel: Function;
  options: any;
  selectedOptions: any;
  icon?: any;
  optionLabel?: string;
  additionalOptionLabel?: string;
  onChange?: any;
  asyncSearch?: boolean;
}

export const SearchDialogBox = (props: SearchDialogBoxProps) => {
  const {
    asyncSearch,
    icon,
    options,
    selectedOptions,
    title,
    handleOk,
    optionLabel,
    additionalOptionLabel,
    handleCancel,
    onChange,
  } = props;

  const [selectedOption, setSelectedOptions] = useState<Array<string>>([]);
  const [asyncSelectedOptions, setAsyncSelectedOptions] = useState<Array<any>>([]);

  useEffect(() => {
    if (!asyncSearch) {
      setSelectedOptions(options.filter((option: any) => selectedOptions.includes(option.id)));
    }
  }, [selectedOptions, options]);

  useEffect(() => {
    if (asyncSearch === true) {
      setAsyncSelectedOptions(selectedOptions);
    }
  }, [selectedOptions]);

  const changeValue = (event: any, value: any) => {
    setSelectedOptions(value);
  };

  return (
    <DialogBox
      title={title}
      handleOk={() =>
        handleOk(
          asyncSearch
            ? asyncSelectedOptions.map((option: any) => option.id)
            : selectedOption.map((option: any) => option.id)
        )
      }
      handleCancel={handleCancel}
      titleAlign="left"
      buttonOk="Save"
    >
      <div className={styles.DialogBox}>
        <FormControl fullWidth>
          <AutoComplete
            asyncSearch={asyncSearch}
            asyncValues={{ value: asyncSelectedOptions, setValue: setAsyncSelectedOptions }}
            options={options}
            optionLabel={optionLabel || 'label'}
            additionalOptionLabel={additionalOptionLabel}
            field={{ value: selectedOption }}
            onChange={(value: any) => {
              if (onChange) {
                onChange(value);
              }
            }}
            form={{ setFieldValue: changeValue }}
            textFieldProps={{
              label: 'Search',
              variant: 'outlined',
            }}
            chipIcon={icon}
          />
        </FormControl>
      </div>
    </DialogBox>
  );
};
