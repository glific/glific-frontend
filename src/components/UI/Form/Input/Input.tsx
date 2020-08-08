import React from 'react';
import {
  FormControl,
  OutlinedInput,
  FormHelperText,
  InputLabel,
  InputAdornment,
  IconButton,
} from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import styles from './Input.module.css';

export interface InputProps {
  type?: any;
  field: any;
  disabled?: any;

  label: string;
  form: any;
  placeholder: any;
  rows: number;
  helperText?: string;
  emojiPicker?: boolean | null;
  textArea?: boolean;
  showPassword?: boolean;
  handleClickShowPassword?: any;
}

export const Input: React.SFC<InputProps> = ({ textArea = false, disabled = false, ...props }) => {
  const touched = props.form.touched;
  const error = props.form.errors;
  const name = props.field.name;

  let fieldEndAdorment = null;
  if (props.type === 'password') {
    fieldEndAdorment = (
      <InputAdornment position="end">
        <IconButton
          aria-label="toggle password visibility"
          onClick={props.handleClickShowPassword()}
          edge="end"
        >
          {props.showPassword ? <Visibility /> : <VisibilityOff />}
        </IconButton>
      </InputAdornment>
    );
  } else if (props.emojiPicker) {
    fieldEndAdorment = props.emojiPicker;
  }

  return (
    <div className={styles.Input}>
      <FormControl fullWidth error={error[name] && touched[name] ? true : false}>
        <InputLabel variant="outlined" className={styles.Label}>
          {props.placeholder}
        </InputLabel>
        <OutlinedInput
          type={props.type}
          classes={{ multiline: styles.Multiline }}
          disabled={disabled}
          error={error[name] && touched[name] ? true : false}
          multiline={textArea}
          rows={props.rows}
          label={props.placeholder}
          fullWidth
          {...props.field}
          endAdornment={fieldEndAdorment}
        ></OutlinedInput>
        {error[name] && touched[name] ? <FormHelperText>{error[name]}</FormHelperText> : null}
        {props.helperText ? (
          <FormHelperText className={styles.HelperText}>{props.helperText}</FormHelperText>
        ) : null}
      </FormControl>
    </div>
  );
};
