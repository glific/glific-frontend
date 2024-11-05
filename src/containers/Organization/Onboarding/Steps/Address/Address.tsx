import { OutlinedInput, Typography } from '@mui/material';
import styles from './Address.module.css';

interface RegisteredAddressProps {
  inputLabel: string;
  inputLabelSubtext: any;
  address: any;
  disabled: boolean;
  setAddress: any;
  form: { touched: any; errors: any; setFieldValue: any };
  field: { name: string; value: any };
}

function x(str: string) {
  return str
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/([a-z])([0-9])/gi, '$1 $2') // Insert space before digits
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
}

export const RegisteredAddress = ({
  inputLabel,
  address,
  disabled,
  inputLabelSubtext,
  form,
  field,
}: RegisteredAddressProps) => {
  const handleChange = (e: any, value: any) => {
    form.setFieldValue(field.name, {
      ...field.value,
      [value]: e.target.value,
    });
  };

  const errors = form.errors[field.name];
  const touched = form.touched[field.name];

  return (
    <div>
      <Typography variant="caption" className={styles.Heading} data-testid="inputLabel">
        {inputLabel}
        {inputLabelSubtext}
      </Typography>

      <div className={styles.AddressField}>
        {Object.keys(address)
          .slice(0, 2)
          .map((key) => (
            <div className={styles.FullRow} key={key}>
              <p className={styles.Label}>{x(key)}</p>
              <OutlinedInput
                disabled={disabled}
                className={styles.InputBox}
                classes={{ input: styles.OutlinedInput }}
                onChange={(e) => handleChange(e, key)}
                value={field.value[key]}
              />
              <p className={styles.Errors}>
                {touched && errors && touched[key] && errors[key] ? errors[key] : ''}
              </p>
            </div>
          ))}
        {Object.keys(address)
          .slice(2)
          .map((key) => (
            <div className={styles.Row} key={key}>
              <p className={styles.Label}>{x(key)}</p>
              <OutlinedInput
                disabled={disabled}
                className={styles.InputBox}
                classes={{ input: styles.OutlinedInput }}
                onChange={(e) => handleChange(e, key)}
                value={field.value[key]}
              />
              <p className={styles.Errors}>
                {touched && errors && touched[key] && errors[key] ? errors[key] : ''}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};
