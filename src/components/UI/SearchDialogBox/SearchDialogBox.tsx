import React, { useState, useEffect } from 'react';
import { DialogBox } from '../DialogBox/DialogBox';
import { FormControl, Paper, Chip, TextField } from '@material-ui/core';
import styles from './SearchDialogBox.module.css';
import { ReactComponent as DeleteIcon } from '../../../assets/images/icons/Close.svg';
import AutoComplete from '@material-ui/lab/Autocomplete';

export interface SearchDialogBoxProps {
  title: string;
  handleOk: Function;
  handleCancel: Function;
  options: any;
  selectedOptions: any;
  disableCloseOnSelect?:boolean;
}

export const SearchDialogBox = ({disableCloseOnSelect=false,...props}: any) => {
  const [selectedOptions, setSelectedOptions] = useState<Array<string>>([]);

  useEffect(() => {
    setSelectedOptions(props.selectedOptions);
  }, [props.selectedOptions]);

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
          <AutoComplete
          disableCloseOnSelect={disableCloseOnSelect}
            className={styles.Autocomplete}
            PaperComponent={({ className, ...props }) => (
              <Paper
                className={`${styles.Paper} ${className}`}
                {...props}
                data-testid="dialogInput"
              ></Paper>
            )}
            value={props.options.filter((option: any) =>
              selectedOptions.includes(option.id.toString())
            )}
            renderTags={(value: any, getTagProps) =>
              value.map((option: any, index: number) => (
                <Chip
                  data-testid="searchChip"
                  style={{ backgroundColor: '#e2f1ea', color: '#073F24', fontSize: '16px' }}
                  label={option.label}
                  {...getTagProps({ index })}
                  deleteIcon={<DeleteIcon className={styles.DeleteIcon} data-testid="deleteIcon" />}
                />
              ))
            }
            multiple
            freeSolo
            onChange={(event, value: any) => {
              setSelectedOptions(value.map((option: any) => option.id));
            }}
            options={props.options ? props.options : []}
            getOptionLabel={(option: any) => option.label}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" data-testid="dialogInput" label="Search" />
            )}
          ></AutoComplete>
        </FormControl>
      </div>
    </DialogBox>
  );
};
