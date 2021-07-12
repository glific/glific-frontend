import React from 'react';
import { Button, TextField, FormHelperText, FormControl } from '@material-ui/core';

import styles from './QuickReplyTemplate.module.css';
import { ReactComponent as DeleteIcon } from '../../../assets/images/icons/Delete/Red.svg';
import { ReactComponent as AddIcon } from '../../../assets/images/icons/SquareAdd.svg';

export interface QuickReplyTemplateProps {
  index: number;
  inputFields: any;
  form: { touched: any; errors: any; values: any };
  onAddClick: any;
  onRemoveClick: any;
  onInputChange: any;
}

export const QuickReplyTemplate: React.SFC<QuickReplyTemplateProps> = (props) => {
  const {
    index,
    inputFields,
    form: { touched, errors },
    onAddClick,
    onRemoveClick,
    onInputChange,
  } = props;

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

  const name = `Button ${index + 1}`;
  const defaultValue = inputFields && inputFields[index]?.value;
  return (
    <div className={styles.WrapperBackground}>
      <div className={styles.QuickReplyWrapper}>
        <FormControl fullWidth error={isError('value')} className={styles.FormControl}>
          <TextField
            placeholder={name}
            label={name}
            variant="outlined"
            onChange={(e: any) => handleInputChange(e, 'value')}
            value={defaultValue}
            className={styles.TextField}
            error={isError('value')}
          />
          {errors.templateButtons && touched.templateButtons && touched.templateButtons[index] ? (
            <FormHelperText>{errors.templateButtons[index]?.value}</FormHelperText>
          ) : null}
        </FormControl>
        <div>{inputFields.length > 1 ? <DeleteIcon onClick={onRemoveClick} /> : null}</div>
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
  );
};
