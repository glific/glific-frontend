import {
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  FormHelperText,
} from '@mui/material';

import styles from './RadioInput.module.css';

export interface RadioInputProps {
  labelYes?: string;
  labelNo?: string;
  row?: boolean;
  field: any;
  form: { dirty: any; touched: any; errors: any; setFieldValue: any; values: any };
  radioTitle?: string;
  handleChange?: any;
}

export const RadioInput = ({
  labelYes = 'Yes',
  labelNo = 'No',
  row = true,
  field,
  form: { touched, errors, setFieldValue, values },
  radioTitle,
  handleChange,
}: RadioInputProps) => {
  const selectedValue = values[field.name];

  const isChecked = (value: any) => selectedValue === value;

  const handleRadioChange = (value: boolean) => {
    setFieldValue(field.name, value);
    if (handleChange) {
      handleChange(value);
    }
  };

  let radioGroupLabel: any;
  if (radioTitle) {
    radioGroupLabel = <FormLabel component="legend">{radioTitle}</FormLabel>;
  }

  return (
    <FormControl component="fieldset">
      {radioGroupLabel}
      <RadioGroup row={row} name="radio-buttons">
        <FormControlLabel
          value={1}
          control={
            <Radio
              color="primary"
              onClick={() => handleRadioChange(true)}
              checked={isChecked(true)}
            />
          }
          label={labelYes}
          className={styles.Label}
        />
        <FormControlLabel
          value={0}
          control={
            <Radio
              color="primary"
              onClick={() => handleRadioChange(false)}
              checked={isChecked(false)}
            />
          }
          label={labelNo}
          className={styles.Label}
        />
      </RadioGroup>
      {errors[field.name] && touched[field.name] ? (
        <FormHelperText className={styles.DangerText}>{errors[field.name]}</FormHelperText>
      ) : null}
    </FormControl>
  );
};
