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
  field: { name: string; onChange: any; value: any };
  disabled?: any;
  editor?: any;
  label: string;
  form?: { touched: any; errors: any };
  placeholder: any;
  rows?: number;
  helperText?: any;
  emojiPicker?: any;
  textArea?: boolean;
  togglePassword?: boolean;
  endAdornmentCallback?: any;
  validate?: any;
  endAdornment?: any;
  inputProp?: any;
  dropdown?: any;
}

export const Input: React.SFC<InputProps> = ({ textArea = false, disabled = false, ...props }) => {
  const {
    field,
    form,
    helperText,
    type,
    togglePassword,
    endAdornmentCallback,
    emojiPicker,
    placeholder,
    editor,
    rows,
    endAdornment,
    inputProp,
    dropdown,
  } = props;

  let fieldType = type;
  let fieldEndAdorment = null;
  if (type === 'password') {
    // we should change the type to text if user has clicked on show password
    if (togglePassword) {
      fieldType = 'text';
    }
    fieldEndAdorment = (
      <InputAdornment position="end">
        <IconButton
          aria-label="toggle password visibility"
          data-testid="passwordToggle"
          onClick={endAdornmentCallback}
          edge="end"
        >
          {togglePassword ? (
            <Visibility classes={{ root: styles.Visibility }} />
          ) : (
            <VisibilityOff classes={{ root: styles.Visibility }} />
          )}
        </IconButton>
      </InputAdornment>
    );
  } else if (emojiPicker) {
    fieldEndAdorment = emojiPicker;
  } else if (type === 'otp') {
    fieldType = 'text';
    fieldEndAdorment = (
      <InputAdornment position="end">
        <IconButton
          aria-label="resend otp"
          data-testid="resendOtp"
          onClick={endAdornmentCallback}
          edge="end"
        >
          <p className={styles.Resend}>resend</p>{' '}
          <RefreshIcon classes={{ root: styles.ResendButton }} />
        </IconButton>
      </InputAdornment>
    );
  }

  return (
    <div className={styles.Input} data-testid="input">
      <FormControl fullWidth error={form && form.errors[field.name] && form.touched[field.name]}>
        <InputLabel variant="outlined" className={styles.Label} data-testid="inputLabel">
          {placeholder}
        </InputLabel>
        <OutlinedInput
          data-testid="outlinedInput"
          inputComponent={editor ? editor.inputComponent : undefined}
          inputProps={editor ? editor.inputProps : inputProp}
          type={fieldType}
          classes={{ multiline: styles.Multiline }}
          disabled={disabled}
          error={form && form.errors[field.name] && form.touched[field.name]}
          multiline={textArea}
          rows={rows}
          className={styles.OutlineInput}
          label={placeholder}
          fullWidth
          {...field}
          endAdornment={endAdornment || fieldEndAdorment}
        />
        {form && form.errors[field.name] && form.touched[field.name] ? (
          <FormHelperText className={styles.DangerText}>{form.errors[field.name]}</FormHelperText>
        ) : null}
        {helperText ? (
          <FormHelperText id="helper-text" className={styles.HelperText}>
            {helperText}
          </FormHelperText>
        ) : null}
        {dropdown && dropdown}
      </FormControl>
    </div>
  );
};
