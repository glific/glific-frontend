import { Checkbox as CheckboxElement, FormControlLabel, FormHelperText } from '@mui/material';
import InfoIcon from 'assets/images/icons/Info.svg?react';
import Tooltip from 'components/UI/Tooltip/Tooltip';
import styles from './Checkbox.module.css';
import { ReactNode } from 'react';

export interface CheckboxProps {
  field: any;
  title: string | ReactNode;
  form?: any;
  handleChange?: Function;
  info?: { title: string };
  darkCheckbox?: boolean;
  disabled?: boolean;
  addLabelStyle?: boolean;
  infoType?: 'tooltip' | 'dialog';
  handleInfoClick?: Function;
  className?: string;
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
  className = '',
  handleInfoClick = () => {},
}: CheckboxProps) => {
  const handleChangeCallback = () => {
    const { name, value } = field;
    form.setFieldValue(name, !value);
    if (handleChange) handleChange(!value);
  };

  return (
    <div className={`${styles.Checkbox} ${className}`}>
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
      {info?.title && infoType === 'tooltip' && (
        <Tooltip tooltipClass={styles.Tooltip} title={info.title} placement="right">
          <InfoIcon className={styles.InfoIcon} />
        </Tooltip>
      )}
      {info && infoType === 'dialog' && (
        <InfoIcon
          className={styles.InfoIcon}
          data-testid="info-icon"
          onClick={() => handleInfoClick()}
        />
      )}
      {form && form.errors[field.name] && form.touched[field.name] ? (
        <FormHelperText className={styles.DangerText}>{form.errors[field.name]}</FormHelperText>
      ) : null}
    </div>
  );
};
