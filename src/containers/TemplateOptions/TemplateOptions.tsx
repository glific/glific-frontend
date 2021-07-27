import React from 'react';
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  FormHelperText,
  FormControl,
} from '@material-ui/core';
import { FieldArray } from 'formik';

import styles from './TemplateOptions.module.css';
import { Button } from '../../components/UI/Form/Button/Button';
import Tooltip from '../../components/UI/Tooltip/Tooltip';
import { ReactComponent as DeleteIcon } from '../../assets/images/icons/Delete/Red.svg';
import { ReactComponent as InfoIcon } from '../../assets/images/icons/Info.svg';
import { ReactComponent as CrossIcon } from '../../assets/images/icons/Cross.svg';
import {
  GUPSHUP_CALL_TO_ACTION,
  GUPSHUP_QUICK_REPLY,
  CALL_TO_ACTION,
  QUICK_REPLY,
} from '../../common/constants';

export interface TemplateOptionsProps {
  isAddButtonChecked: boolean;
  templateType: string | null;
  inputFields: Array<any>;
  form: { touched: any; errors: any; values: any };
  onAddClick: any;
  onRemoveClick: any;
  onInputChange: any;
  onTemplateTypeChange: any;
  disabled: any;
}
export const TemplateOptions: React.SFC<TemplateOptionsProps> = ({
  isAddButtonChecked,
  templateType,
  inputFields,
  form: { touched, errors, values },
  onAddClick,
  onRemoveClick,
  onTemplateTypeChange,
  onInputChange,
  disabled = false,
}) => {
  const buttonTitle = 'Button Title';
  const buttonValue = 'Button Value';
  const buttonTitles: any = {
    CALL_TO_ACTION: 'Call to action',
    QUICK_REPLY: 'Quick Reply',
  };

  const handleAddClick = (helper: any, type: boolean) => {
    const obj = type ? { type: '', value: '', title: '' } : { value: '' };
    helper.push(obj);
    onAddClick();
  };

  const handleRemoveClick = (helper: any, idx: number) => {
    helper.remove(idx);
    onRemoveClick(idx);
  };

  const addButton = (helper: any, type: boolean = false) => {
    const title = templateType ? buttonTitles[templateType] : '';
    const buttonClass =
      templateType === QUICK_REPLY ? styles.QuickReplyAddButton : styles.CallToActionAddButton;
    return (
      <Button
        className={buttonClass}
        variant="outlined"
        color="primary"
        onClick={() => handleAddClick(helper, type)}
      >
        Add {title}
      </Button>
    );
  };

  const getButtons = (row: any, index: number, arrayHelpers: any) => {
    const { type, title, value }: any = row;
    let template: any = null;

    const isError = (key: string) =>
      !!(
        errors.templateButtons &&
        touched.templateButtons &&
        errors.templateButtons[index] &&
        errors.templateButtons[index][key]
      );

    if (templateType === CALL_TO_ACTION) {
      template = (
        <div className={styles.CallToActionContainer} key={index.toString()}>
          <div className={styles.CallToActionWrapper}>
            <div>
              <div className={styles.RadioStyles}>
                <FormControl fullWidth error={isError('type')} className={styles.FormControl}>
                  <RadioGroup
                    aria-label="action-radio-buttons"
                    name="action-radio-buttons"
                    row
                    value={type}
                    onChange={(e: any) => onInputChange(e, row, index, 'type')}
                    className={styles.RadioGroup}
                  >
                    <FormControlLabel
                      value="phone_number"
                      control={
                        <Radio
                          color="primary"
                          disabled={
                            (index === 0 &&
                              inputFields.length > 1 &&
                              inputFields[0].type !== 'phone_number') ||
                            (index > 0 &&
                              inputFields[0].type &&
                              inputFields[0].type === 'phone_number')
                          }
                        />
                      }
                      label="Phone number"
                    />
                    <FormControlLabel
                      value="url"
                      control={
                        <Radio
                          color="primary"
                          disabled={
                            (index === 0 &&
                              inputFields.length > 1 &&
                              inputFields[0].type !== 'url') ||
                            (index > 0 && inputFields[0].type && inputFields[0].type === 'url')
                          }
                        />
                      }
                      label="URL"
                    />
                  </RadioGroup>
                  {errors.templateButtons &&
                  touched.templateButtons &&
                  touched.templateButtons[index] ? (
                    <FormHelperText>{errors.templateButtons[index]?.type}</FormHelperText>
                  ) : null}
                </FormControl>
              </div>
              <div>
                {inputFields.length > 1 ? (
                  <DeleteIcon onClick={() => handleRemoveClick(arrayHelpers, index)} />
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
                  onBlur={(e: any) => onInputChange(e, row, index, 'title')}
                  className={styles.TextField}
                  error={isError('title')}
                />
                {errors.templateButtons &&
                touched.templateButtons &&
                touched.templateButtons[index] ? (
                  <FormHelperText>{errors.templateButtons[index]?.title}</FormHelperText>
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
                  onBlur={(e: any) => onInputChange(e, row, index, 'value')}
                  className={styles.TextField}
                  error={isError('value')}
                />
                {errors.templateButtons &&
                touched.templateButtons &&
                touched.templateButtons[index] ? (
                  <FormHelperText>{errors.templateButtons[index]?.value}</FormHelperText>
                ) : null}
              </FormControl>
            </div>
          </div>
          <div>
            {inputFields.length === index + 1 && inputFields.length !== 2
              ? addButton(arrayHelpers, true)
              : null}
          </div>
        </div>
      );
    }

    if (templateType === QUICK_REPLY) {
      template = (
        <div className={styles.QuickReplyContainer} key={index.toString()}>
          <div className={styles.QuickReplyWrapper}>
            <FormControl fullWidth error={isError('value')} className={styles.FormControl}>
              <TextField
                title={title}
                placeholder={`Quick reply ${index + 1} title`}
                label={`Quick reply ${index + 1} title`}
                variant="outlined"
                onBlur={(e: any) => onInputChange(e, row, index, 'value')}
                className={styles.TextField}
                error={isError('value')}
                InputProps={{
                  endAdornment:
                    inputFields.length > 1 ? (
                      <CrossIcon
                        className={styles.RemoveIcon}
                        title="Remove"
                        onClick={() => handleRemoveClick(arrayHelpers, index)}
                      />
                    ) : null,
                }}
              />
              {errors.templateButtons &&
              touched.templateButtons &&
              touched.templateButtons[index] ? (
                <FormHelperText>{errors.templateButtons[index]?.value}</FormHelperText>
              ) : null}
            </FormControl>
          </div>
          <div>
            {inputFields.length === index + 1 && inputFields.length !== 3
              ? addButton(arrayHelpers)
              : null}
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
        <div className={styles.RadioLabelWrapper}>
          <FormControlLabel
            value={CALL_TO_ACTION}
            control={<Radio color="primary" />}
            label="Call to actions"
            classes={{ root: styles.RadioLabel }}
          />
          <Tooltip title={GUPSHUP_CALL_TO_ACTION} placement="right" tooltipClass={styles.Tooltip}>
            <InfoIcon />
          </Tooltip>
        </div>
        <div className={styles.RadioLabelWrapper}>
          <FormControlLabel
            value={QUICK_REPLY}
            control={<Radio color="primary" />}
            label="Quick replies"
            className={styles.RadioLabel}
          />
          <Tooltip title={GUPSHUP_QUICK_REPLY} placement="right" tooltipClass={styles.Tooltip}>
            <InfoIcon />
          </Tooltip>
        </div>
      </RadioGroup>

      {templateType ? (
        <div
          className={
            templateType === QUICK_REPLY
              ? styles.QuickTemplateFields
              : styles.CallToActionTemplateFields
          }
        >
          <FieldArray
            name="templateButtons"
            render={(arrayHelpers) =>
              values.templateButtons.map((row: any, index: any) =>
                getButtons(row, index, arrayHelpers)
              )
            }
          />
        </div>
      ) : null}
    </div>
  );

  return <div>{isAddButtonChecked && !disabled ? radioTemplateType : null}</div>;
};
