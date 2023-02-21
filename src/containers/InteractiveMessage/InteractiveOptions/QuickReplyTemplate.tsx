import { Button, TextField, FormHelperText, FormControl } from '@mui/material';

import { ReactComponent as CrossIcon } from 'assets/images/icons/Cross.svg';
import { ReactComponent as AddIcon } from 'assets/images/icons/SquareAdd.svg';
import styles from './QuickReplyTemplate.module.css';

export interface QuickReplyTemplateProps {
  index: number;
  inputFields: any;
  form: { touched: any; errors: any; values: any };
  onAddClick: any;
  onRemoveClick: any;
  onInputChange: any;
  translation?: any;
}

export const QuickReplyTemplate = ({
  index,
  inputFields,
  form: { touched, errors },
  onAddClick,
  onRemoveClick,
  onInputChange,
  translation,
}: QuickReplyTemplateProps) => {
  const isError = (key: string) =>
    !!(
      errors.templateButtons &&
      touched.templateButtons &&
      errors.templateButtons[index] &&
      errors.templateButtons[index][key]
    );

  const handleInputChange = (event: any, key: string) => {
    const { value } = event.target;
    const payload = { key };
    onInputChange(value, payload);
  };

  const name = 'Enter button text(20 char.)';
  const defaultValue = inputFields && inputFields[index]?.value;
  const endAdornmentIcon = inputFields.length > 1 && (
    <CrossIcon className={styles.RemoveIcon} title="Remove" onClick={onRemoveClick} />
  );

  return (
    <>
      {translation && <div className={styles.Translation}>{translation}</div>}
      <div className={styles.WrapperBackground}>
        <div className={styles.QuickReplyWrapper}>
          <FormControl fullWidth error={isError('value')} className={styles.FormControl}>
            <TextField
              placeholder={name}
              variant="outlined"
              onChange={(e: any) => handleInputChange(e, 'value')}
              value={defaultValue}
              className={styles.TextField}
              InputProps={{
                endAdornment: endAdornmentIcon,
              }}
              error={isError('value')}
            />
            {errors.templateButtons && touched.templateButtons && touched.templateButtons[index] ? (
              <FormHelperText>{errors.templateButtons[index]?.value}</FormHelperText>
            ) : null}
          </FormControl>
        </div>
        <div>
          {inputFields.length === index + 1 && inputFields.length !== 3 ? (
            <Button
              color="primary"
              onClick={onAddClick}
              className={styles.AddButton}
              startIcon={<AddIcon className={styles.AddIcon} />}
            >
              Add quick reply
            </Button>
          ) : null}
        </div>
      </div>
    </>
  );
};
