import React, { useState, useEffect } from 'react';
import { FormControl } from '@material-ui/core';

import { DialogBox } from '../DialogBox/DialogBox';
import styles from './SearchDialogBox.module.css';
import { AutoComplete } from '../Form/AutoComplete/AutoComplete';

export interface SearchDialogBoxProps {
  title: string;
  handleOk: Function;
  handleCancel: Function;
  options: any;
  selectedOptions: any;
  icon?: any;
  optionLabel?: string;
  onChange?: any;
  asyncSearch?: boolean;
}

export const SearchDialogBox = (props: SearchDialogBoxProps) => {
  const { asyncSearch, icon } = props;

  const [selectedOptions, setSelectedOptions] = useState<Array<string>>([]);
  const [asyncSelectedOptions, setAsyncSelectedOptions] = useState<Array<any>>([]);

  useEffect(() => {
    if (!asyncSearch) {
      setSelectedOptions(
        props.options.filter((option: any) => props.selectedOptions.includes(option.id))
      );
    }
  }, [props.selectedOptions, props.options]);

  useEffect(() => {
    if (asyncSearch === true) {
      setAsyncSelectedOptions(props.selectedOptions);
    }
  }, [props.selectedOptions]);

  const changeValue = (event: any, value: any) => {
    setSelectedOptions(value);
  };

  return (
    <DialogBox
      title={props.title}
      handleOk={() =>
        props.handleOk(
          asyncSearch
            ? asyncSelectedOptions.map((option: any) => option.id)
            : selectedOptions.map((option: any) => option.id)
        )
      }
      handleCancel={props.handleCancel}
      titleAlign="left"
      buttonOk="Save"
    >
      <div className={styles.DialogBox}>
        <FormControl fullWidth>
          <AutoComplete
            asyncSearch={asyncSearch}
            asyncValues={{ value: asyncSelectedOptions, setValue: setAsyncSelectedOptions }}
            options={props.options}
            optionLabel={props.optionLabel ? props.optionLabel : 'label'}
            field={{ value: selectedOptions }}
            onChange={(value: any) => props.onChange(value)}
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
