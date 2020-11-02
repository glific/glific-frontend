import React, { useState } from 'react';
import { DialogBox } from '../DialogBox/DialogBox';
import { Dropdown } from '../Form/Dropdown/Dropdown';

import styles from './DropdownDialog.module.css';

export interface DropdownDialogProps {
  title: string;
  handleOk: Function;
  handleCancel: Function;
  options: any;
  placeholder?: any;
  description?: string;
}

export const DropdownDialog: React.FC<DropdownDialogProps> = (props: DropdownDialogProps) => {
  const [selectedValue, setSelectedValue] = useState('');
  const handleChange = (event: any) => {
    setSelectedValue(event.target.value);
  };
  return (
    <DialogBox
      title={props.title}
      handleOk={() => props.handleOk(selectedValue)}
      handleCancel={props.handleCancel}
      titleAlign="left"
      buttonOk="Start"
    >
      <div className={styles.DialogBox}>
        <Dropdown
          options={props.options}
          label={props.title}
          placeholder={props.placeholder}
          field={{ onChange: handleChange, value: selectedValue }}
        ></Dropdown>

        <div className={styles.Message} data-testid="description">
          {props.description}
        </div>
      </div>
    </DialogBox>
  );
};
