import React, { useState, useEffect } from 'react';
import { DialogBox } from '../DialogBox/DialogBox';
import {
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Checkbox,
  FormControlLabel,
} from '@material-ui/core';
import styles from './SearchDialogBox.module.css';
import { ReactComponent as SearchIcon } from '../../../assets/images/icons/Search/Desktop.svg';

export interface SearchDialogBoxProps {
  title: string;
  handleOk: Function;
  handleCancel: Function;
  options: any;
  selectedOptions: any;
}

export const SearchDialogBox = (props: any) => {
  const [search, setSearch] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Array<string>>([]);

  useEffect(() => {
    setSelectedOptions(props.selectedOptions);
  }, [props.selectedOptions]);

  const handleCheckboxChange = (event: any) => {
    const optionId = event.target.id;
    const index = selectedOptions.indexOf(optionId.toString());
    if (index > -1) {
      setSelectedOptions(selectedOptions.filter((option) => option !== optionId));
    } else {
      setSelectedOptions([...selectedOptions, event.target.id]);
    }
  };

  let optionsList = null;
  optionsList = props.options.map((option: any) => {
    if (option.label.toLowerCase().includes(search)) {
      return (
        <div>
          <FormControlLabel
            className={styles.Label}
            control={
              <Checkbox
                checked={selectedOptions.includes(option.id)}
                color="primary"
                id={option.id}
                onChange={handleCheckboxChange}
              />
            }
            label={option.label}
          />
        </div>
      );
    }
  });
  return (
    <DialogBox
      title={props.title}
      handleOk={() => props.handleOk(selectedOptions)}
      handleCancel={props.handleCancel}
      titleAlign="left"
      buttonOk="Save"
    >
      <div className={styles.DialogBox}>
        <FormControl fullWidth>
          <OutlinedInput
            classes={{
              input: styles.Input,
              notchedOutline: styles.Outline,
            }}
            data-testid="tagSearch"
            className={styles.Label}
            fullWidth
            placeholder="Search"
            onChange={(event) => setSearch(event.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon className={styles.SearchIcon} />
              </InputAdornment>
            }
          />
        </FormControl>
        <div>
          <form className={styles.Form}>{optionsList}</form>
        </div>
      </div>
    </DialogBox>
  );
};
