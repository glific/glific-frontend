import { Select, FormControl, FormHelperText, MenuItem, Typography } from '@mui/material';

import styles from './Dropdown.module.css';

export interface DropdownProps {
  type?: any;
  field?: any;
  options: any;
  label?: string;
  form?: any;
  placeholder: string;
  helperText?: string;
  disabled?: boolean;
  validate?: any;
  fieldChange?: any;
  fieldValue?: any;
}

export const Dropdown = ({
  options,
  placeholder,
  field,
  helperText,
  disabled,
  form,
  fieldValue,
  fieldChange,
}: DropdownProps) => {
  const { onChange, value, ...rest } = field;

  const optionsList = options.map((option: any) => (
    <MenuItem value={option.id} key={option.id}>
      {option.label ? option.label : option.name}
    </MenuItem>
  ));

  return (
    <div className={styles.Dropdown} data-testid="dropdown">
      <FormControl
        variant="outlined"
        fullWidth
        error={form && form.errors[field.name] && form.touched[field.name]}
      >
        {placeholder && (
          <Typography data-testid="inputLabel" variant="h5" className={styles.FieldLabel}>
            {placeholder}
          </Typography>
        )}
        <Select
          onChange={(event) => {
            onChange(event);
            if (fieldChange) {
              fieldChange(event);
            }
          }}
          MenuProps={{
            classes: {
              paper: styles.Paper,
            },
          }}
          classes={{ outlined: styles.Outlined }}
          value={fieldValue !== undefined ? fieldValue : value}
          {...rest}
          fullWidth
          disabled={disabled}
        >
          {optionsList}
        </Select>
        {form && form.errors[field.name] && form.touched[field.name] ? (
          <FormHelperText>{form.errors[field.name]}</FormHelperText>
        ) : null}
        {helperText ? (
          <FormHelperText className={styles.HelperText}>{helperText}</FormHelperText>
        ) : null}
      </FormControl>
    </div>
  );
};
