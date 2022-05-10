import React, { useState } from 'react';

import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import styles from './DropdownDialog.module.css';

export interface DropdownDialogProps {
  title: string;
  handleOk: Function;
  handleCancel: Function;
  options: any;
  placeholder?: any;
  description?: string;
}

export const DropdownDialog = ({
  title,
  handleCancel,
  options,
  placeholder,
  description,
  handleOk,
}: DropdownDialogProps) => {
  const [selectedValue, setSelectedValue] = useState('');

  const handleChange = (event: any) => {
    setSelectedValue(event.target.value);
  };

  const handleOkDialog = () => {
    if (selectedValue) {
      handleOk(selectedValue);
    }
  };

  return (
    <DialogBox
      title={title}
      handleOk={handleOkDialog}
      handleCancel={handleCancel}
      titleAlign="left"
      buttonOk="Start"
    >
      <div className={styles.DialogBox}>
        <Dropdown
          options={options}
          label={title}
          placeholder={placeholder}
          field={{ onChange: handleChange, value: selectedValue }}
        />

        <div className={styles.Message} data-testid="description">
          {description}
        </div>
      </div>
    </DialogBox>
  );
};
