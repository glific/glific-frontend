import React from 'react';
import { Checkbox as CheckboxElement, FormControlLabel } from '@material-ui/core';
import { ReactComponent as InfoIcon } from 'assets/images/icons/Info.svg';

import Tooltip from 'components/UI/Tooltip/Tooltip';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
  field: any;
  title: string;
  form?: any;
  handleChange?: Function;
  info?: { title: string };
  darkCheckbox?: boolean;
  disabled?: boolean;
  addLabelStyle?: boolean;
  infoType?: 'tooltip' | 'dialog';
  handleInfoClick?: Function;
}

export const Checkbox = ({
  field,
  title,
  info = { title: '' },
  darkCheckbox,
  disabled = false,
  addLabelStyle = true,
  form,
  handleChange,
  infoType = 'tooltip',
  handleInfoClick = () => {},
}: CheckboxProps) => {
  const handleChangeCallback = () => {
    const { name, value } = field;
    form.setFieldValue(name, !value);
    if (handleChange) handleChange(!value);
  };

  return (
    <div className={styles.Checkbox}>
      <FormControlLabel
        control={
          <CheckboxElement
            data-testid="checkboxLabel"
            classes={darkCheckbox ? { colorPrimary: styles.CheckboxColor } : null}
            {...field}
            color="primary"
            checked={field.value ? field.value : false}
            onChange={handleChangeCallback}
            disabled={disabled}
          />
        }
        labelPlacement="end"
        label={title}
        classes={{
          label: addLabelStyle ? styles.Label : undefined,
          root: styles.Root,
        }}
      />
      {info && infoType === 'tooltip' && (
        <Tooltip tooltipClass={styles.Tooltip} title={info.title} placement="right">
          <InfoIcon />
        </Tooltip>
      )}
      {info && infoType === 'dialog' && (
        <InfoIcon className={styles.InfoIcon} onClick={() => handleInfoClick()} />
      )}
    </div>
  );
};
