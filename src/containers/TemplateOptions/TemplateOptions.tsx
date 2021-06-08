import React from 'react';
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  FormHelperText,
  FormControl,
} from '@material-ui/core';

import styles from './TemplateOptions.module.css';
import { Button } from '../../components/UI/Form/Button/Button';
import { ReactComponent as DeleteIcon } from '../../assets/images/icons/Delete/Red.svg';

export interface TemplateOptionsProps {
  isAddButtonChecked: boolean;
  templateType: string | null;
  inputFields: Array<any>;
  form: { touched: any; errors: any };
  onAddClick: any;
  onRemoveClick: any;
  onInputChange: any;
  onTemplateTypeChange: any;
}
export const TemplateOptions: React.SFC<TemplateOptionsProps> = ({
  isAddButtonChecked,
  templateType,
  inputFields,
  form: { touched, errors },
  onAddClick,
  onRemoveClick,
  onTemplateTypeChange,
  onInputChange,
}) => {
  const buttonTitle = 'Button Title';
  const buttonValue = 'Button Value';

  const addButton = (
    <Button variant="outlined" color="primary" onClick={() => onAddClick(true)}>
      Add {templateType?.replaceAll('-', ' ')}
    </Button>
  );

  const getButtons = (row: any, index: number) => {
    const { type, title, value }: any = row;
    let template: any = null;

    const isError = (key: string) =>
      errors.templateButtons && errors.templateButtons[index] && errors.templateButtons[index][key];

    if (templateType === 'call-to-action') {
      template = (
        <div className={styles.WrapperBackground}>
          <div className={styles.CallToActionWrapper}>
            <div>
              <div className={styles.RadioStyles}>
                <FormControl fullWidth error={isError('type')} className={styles.FormControl}>
                  <RadioGroup
                    aria-label="call-to-action"
                    name="call-to-action"
                    row
                    value={type}
                    onChange={(e: any) => onInputChange(e, row, index, 'type')}
                  >
                    <FormControlLabel
                      value="phone-no"
                      control={<Radio color="primary" />}
                      label="Phone number"
                    />
                    <FormControlLabel value="url" control={<Radio color="primary" />} label="URL" />
                  </RadioGroup>
                  {errors.templateButtons &&
                  touched.templateButtons &&
                  touched.templateButtons[index] ? (
                    <FormHelperText>{errors.templateButtons[index].type}</FormHelperText>
                  ) : null}
                </FormControl>
              </div>
              <div>
                {inputFields.length > 1 ? (
                  <DeleteIcon onClick={() => onRemoveClick(index)} />
                ) : null}
              </div>
            </div>
            <div className={styles.TextFieldWrapper}>
              <FormControl fullWidth error={isError('title')} className={styles.FormControl}>
                <TextField
                  title={title}
                  placeholder={buttonTitle}
                  variant="outlined"
                  label={buttonTitle}
                  onChange={(e: any) => onInputChange(e, row, index, 'title')}
                  className={styles.TextField}
                  error={isError('value')}
                />
                {errors.templateButtons &&
                touched.templateButtons &&
                touched.templateButtons[index] ? (
                  <FormHelperText>{errors.templateButtons[index].title}</FormHelperText>
                ) : null}
              </FormControl>
            </div>
            <div className={styles.TextFieldWrapper}>
              <FormControl fullWidth error={isError('value')} className={styles.FormControl}>
                <TextField
                  title={value}
                  placeholder={buttonValue}
                  variant="outlined"
                  label={buttonValue}
                  onChange={(e: any) => onInputChange(e, row, index, 'value')}
                  className={styles.TextField}
                  error={isError('value')}
                />
                {errors.templateButtons &&
                touched.templateButtons &&
                touched.templateButtons[index] ? (
                  <FormHelperText>{errors.templateButtons[index].value}</FormHelperText>
                ) : null}
              </FormControl>
            </div>
          </div>
          <div>
            {inputFields.length === index + 1 && inputFields.length !== 2 ? addButton : null}
          </div>
        </div>
      );
    }

    if (templateType === 'quick-reply') {
      template = (
        <div className={styles.WrapperBackground}>
          <div className={styles.QuickReplyWrapper}>
            <FormControl fullWidth error={isError('value')} className={styles.FormControl}>
              <TextField
                title={title}
                placeholder={buttonTitle}
                label={buttonTitle}
                variant="outlined"
                onChange={(e: any) => onInputChange(e, row, index, 'value')}
                className={styles.TextField}
                error={isError('value')}
              />
              {errors.templateButtons &&
              touched.templateButtons &&
              touched.templateButtons[index] ? (
                <FormHelperText>{errors.templateButtons[index].value}</FormHelperText>
              ) : null}
            </FormControl>
            <div>
              {inputFields.length > 1 ? <DeleteIcon onClick={() => onRemoveClick(index)} /> : null}
            </div>
          </div>
          <div>
            {inputFields.length === index + 1 && inputFields.length !== 3 ? addButton : null}
          </div>
        </div>
      );
    }

    return template;
  };

  const radioTemplateType = (
    <div>
      <RadioGroup
        aria-label="template-type"
        name="template-type"
        row
        value={templateType}
        onChange={(event) => onTemplateTypeChange(event.target.value)}
      >
        <FormControlLabel
          value="call-to-action"
          control={<Radio color="primary" />}
          label="Call to actions"
          classes={{ root: styles.RadioLabel }}
        />
        <FormControlLabel
          value="quick-reply"
          control={<Radio color="primary" />}
          label="Quick replies"
          className={styles.RadioLabel}
        />
      </RadioGroup>

      {templateType ? (
        <div>{inputFields.map((row, index): any => getButtons(row, index))}</div>
      ) : null}
    </div>
  );

  return <div>{isAddButtonChecked ? radioTemplateType : null}</div>;
};
