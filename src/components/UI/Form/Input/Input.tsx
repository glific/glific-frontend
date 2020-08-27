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
import RefreshIcon from '@material-ui/icons/Refresh';

import styles from './Input.module.css';

export interface InputProps {
  type?: any;
  field: any;
  disabled?: any;
  editor?: any;
  label: string;
  form: any;
  placeholder: any;
  rows: number;
  helperText?: string;
  emojiPicker?: boolean | null;
  textArea?: boolean;
  togglePassword?: boolean;
  endAdornmentCallback?: any;
}

export const Input: React.SFC<InputProps> = ({ textArea = false, disabled = false, ...props }) => {
  const touched = props.form.touched;
  const error = props.form.errors;
  const name = props.field.name;

  let fieldType = props.type;
  let fieldEndAdorment = null;
  if (props.type === 'password') {
    // we should change the type to text if user has clicked on show password
    if (props.togglePassword) {
      fieldType = 'text';
    }
    fieldEndAdorment = (
      <InputAdornment position="end">
        <IconButton
          aria-label="toggle password visibility"
          onClick={props.endAdornmentCallback}
          edge="end"
        >
          {props.togglePassword ? (
            <Visibility classes={{ root: styles.Visibility }} />
          ) : (
            <VisibilityOff classes={{ root: styles.Visibility }} />
          )}
        </IconButton>
      </InputAdornment>
    );
  } else if (props.emojiPicker) {
    fieldEndAdorment = props.emojiPicker;
  } else if (props.type === 'otp') {
    fieldType = 'text';
    fieldEndAdorment = (
      <InputAdornment position="end">
        <IconButton aria-label="resend password" onClick={props.endAdornmentCallback} edge="end">
          <p className={styles.Resend}>resend</p>{' '}
          <RefreshIcon classes={{ root: styles.ResendButton }} />
        </IconButton>
      </InputAdornment>
    );
  }

  return (
    <div className={styles.Input}>
      <FormControl fullWidth error={error[name] && touched[name] ? true : false}>
        <InputLabel variant="outlined" className={styles.Label}>
          {props.placeholder}
        </InputLabel>
        <OutlinedInput
          inputComponent={props.editor ? props.editor.inputComponent : undefined}
          inputProps={props.editor ? props.editor.inputProps : undefined}
          type={fieldType}
          classes={{ multiline: styles.Multiline }}
          disabled={disabled}
          error={error[name] && touched[name] ? true : false}
          multiline={textArea}
          rows={props.rows}
          className={styles.OutlineInput}
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
