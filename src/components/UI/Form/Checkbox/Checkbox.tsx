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
  checkboxType?: 'normal' | 'iagree';
}

export const Checkbox: React.SFC<CheckboxProps> = (props) => {
  const {
    field,
    title,
    info = false,
    darkCheckbox,
    disabled = false,
    addLabelStyle = true,
    form,
    handleChange,
    infoType = 'tooltip',
    handleInfoClick = () => {},
    checkboxType = 'normal',
  } = props;

  const checkboxClass = () => {
    if (darkCheckbox) {
      return { colorPrimary: styles.CheckboxColor };
    }

    if (checkboxType === 'iagree') {
      return { colorPrimary: styles.GreenCheckboxColor };
    }

    return null;
  };

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
            classes={checkboxClass()}
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
          label: `${addLabelStyle ? styles.Label : styles.LabelNoStyle} ${
            checkboxType === 'iagree' ? styles.GreenCheckboxLabel : null
          }`,
          root: `${styles.Root} ${checkboxType === 'iagree' ? styles.GreenCheckboxRoot : null}`,
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
