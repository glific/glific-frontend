import React, { useState, useEffect } from 'react';
import { DialogBox } from '../DialogBox/DialogBox';
import { FormControl } from '@material-ui/core';
import styles from './SearchDialogBox.module.css';
import { AutoComplete } from '../Form/AutoComplete/AutoComplete';

export interface SearchDialogBoxProps {
  title: string;
  handleOk: Function;
  handleCancel: Function;
  options: any;
  selectedOptions: any;
  icon?: any;
}

export const SearchDialogBox = (props: any) => {
  const [selectedOptions, setSelectedOptions] = useState<Array<string>>([]);

  useEffect(() => {
    setSelectedOptions(
      props.options.filter((option: any) => props.selectedOptions.includes(option.id))
    );
  }, [props.selectedOptions, props.options]);

  const changeValue = (event: any, value: any) => {
    setSelectedOptions(value);
  };

  return (
    <DialogBox
      title={props.title}
      handleOk={() => props.handleOk(selectedOptions.map((option: any) => option.id))}
      handleCancel={props.handleCancel}
      titleAlign="left"
      buttonOk="Save"
    >
      <div className={styles.DialogBox}>
        <FormControl fullWidth>
          <AutoComplete
            options={props.options}
            optionLabel="label"
            field={{ value: selectedOptions }}
            form={{ setFieldValue: changeValue }}
            textFieldProps={{
              label: 'Search',
              variant: 'outlined',
            }}
            chipIcon={props.icon}
          />
        </FormControl>
      </div>
    </DialogBox>
  );
};
