import { OutlinedInput, Typography } from '@mui/material';
import { formatString } from 'common/utils';
import styles from './Address.module.css';

interface RegisteredAddressProps {
  inputLabel: string;
  inputLabelSubtext: any;
  address: any;
  disabled: boolean;
  form: { touched: any; errors: any; setFieldValue: any };
  field: { name: string; value: any };
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
              <p className={styles.Label}>{formatString(key)}</p>
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
              <p className={styles.Label}>{formatString(key)}</p>
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
