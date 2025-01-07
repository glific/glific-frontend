import {
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  FormHelperText,
  FormControl,
  Autocomplete,
  Typography,
} from '@mui/material';
import { FieldArray } from 'formik';

import { Button } from 'components/UI/Form/Button/Button';
import Tooltip from 'components/UI/Tooltip/Tooltip';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import InfoIcon from 'assets/images/icons/Info.svg?react';
import CrossIcon from 'assets/images/icons/Cross.svg?react';
import { GUPSHUP_CALL_TO_ACTION, GUPSHUP_QUICK_REPLY, CALL_TO_ACTION, QUICK_REPLY } from 'common/constants';
import styles from './TemplateOptions.module.css';
import { Fragment } from 'react';

export interface TemplateOptionsProps {
  form: { touched: any; errors: any; values: any; setFieldValue: any };
  disabled: any;
  buttonTypes: any;
  setTemplateButtons: any;
}
export const TemplateOptions = ({
  form: { touched, errors, values, setFieldValue },
  disabled = false,
  buttonTypes,
  setTemplateButtons,
}: TemplateOptionsProps) => {
  const buttonTitle = 'Button Title';
  const buttonValue = 'Button Value';
  const buttonTitles: any = {
    CALL_TO_ACTION: 'Call to action',
    QUICK_REPLY: 'Quick Reply',
  };
  const options = ['Static', 'Dynamic'];
  const { templateType, templateButtons, sampleSuffix, urlType, isAddButtonChecked } = values;

  const handleAddClick = (helper: any, type: boolean) => {
    const obj = type ? { type: '', value: '', title: '' } : { value: '' };
    helper.push(obj);
    setFieldValue('templateButtons', [...templateButtons, buttonTypes[templateType]]);
    setTemplateButtons([...templateButtons, buttonTypes[templateType]]);
  };

  const handleRemoveClick = (helper: any, idx: number) => {
    helper.remove(idx);
    const result = templateButtons.filter((_: any, index: number) => idx !== index);
    setFieldValue('templateButtons', result);
    setTemplateButtons(result);
  };
  console.log(values);

  const handleTemplateTypeChange = (event: any) => {
    const { value } = event.target;
    setFieldValue('templateType', value);
    // setTemplateButtons([buttonTypes[value]]);
    setFieldValue('templateButtons', [buttonTypes[value]]);
  };

  const onInputChange = (event: any, row: any, index: any, eventType: any) => {
    const { value } = event.target;
    let obj = { ...row };

    if (eventType === 'type') {
      obj = { type: value, title: '', value: '' };
    } else {
      obj[eventType] = value;
    }

    const result = templateButtons.map((val: any, idx: number) => {
      if (idx === index) return obj;
      return val;
    });
    console.log(result);

    setFieldValue('templateButtons', result);
  };

  const addButton = (helper: any, type: boolean = false) => {
    const title = templateType ? buttonTitles[templateType] : '';
    const buttonClass = templateType === QUICK_REPLY ? styles.QuickReplyAddButton : styles.CallToActionAddButton;
    return (
      <Button
        className={buttonClass}
        variant="outlined"
        color="primary"
        data-testid="addButton"
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
        <Fragment>
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
                            disabled ||
                            (index === 0 && templateButtons.length > 1 && templateButtons[0].type !== 'phone_number') ||
                            (index > 0 && templateButtons[0].type && templateButtons[0].type === 'phone_number')
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
                            disabled ||
                            (index === 0 && templateButtons.length > 1 && templateButtons[0].type !== 'url') ||
                            (index > 0 && templateButtons[0].type && templateButtons[0].type === 'url')
                          }
                        />
                      }
                      label="URL"
                    />
                  </RadioGroup>
                  {errors.templateButtons && touched.templateButtons && touched.templateButtons[index] ? (
                    <FormHelperText>{errors.templateButtons[index]?.type}</FormHelperText>
                  ) : null}
                </FormControl>
              </div>
              <div>
                {templateButtons.length > 1 ? (
                  <DeleteIcon onClick={() => handleRemoveClick(arrayHelpers, index)} data-testid="delete-icon" />
                ) : null}
              </div>
            </div>
            {type === 'url' && (
              <div className={styles.TextFieldWrapper}>
                <Autocomplete
                  options={options}
                  classes={{ inputRoot: styles.DefaultInputRoot }}
                  renderInput={(params) => <TextField {...params} label="Select URL Type" />}
                  clearIcon={false}
                  value={urlType}
                  onChange={(event: any, newValue: string | null) => {
                    setFieldValue('urlType', newValue);
                  }}
                />
              </div>
            )}
            <div className={styles.TextFieldWrapper} data-testid="buttonTitle">
              <FormControl fullWidth error={isError('title')} className={styles.FormControl}>
                <TextField
                  disabled={disabled}
                  title={title}
                  value={title}
                  label={buttonTitle}
                  variant="outlined"
                  onChange={(e: any) => onInputChange(e, row, index, 'title')}
                  className={styles.TextField}
                  error={isError('title')}
                />
                {errors.templateButtons && touched.templateButtons && touched.templateButtons[index] ? (
                  <FormHelperText>{errors.templateButtons[index]?.title}</FormHelperText>
                ) : null}
              </FormControl>
            </div>
            <div className={styles.TextFieldWrapper} data-testid="buttonValue">
              <FormControl fullWidth error={isError('value')} className={styles.FormControl}>
                <TextField
                  title={value}
                  value={value}
                  disabled={disabled}
                  label={buttonValue}
                  variant="outlined"
                  onChange={(e: any) => onInputChange(e, row, index, 'value')}
                  className={styles.TextField}
                  error={isError('value')}
                />
                {errors.templateButtons && touched.templateButtons && touched.templateButtons[index] ? (
                  <FormHelperText>{errors.templateButtons[index]?.value}</FormHelperText>
                ) : null}
              </FormControl>
            </div>
            {urlType === 'Dynamic' && type === 'url' && (
              <div>
                <FormControl fullWidth error={isError('title')} className={styles.FormControl}>
                  <TextField
                    disabled={disabled}
                    label={'Sample Suffix'}
                    className={styles.TextField}
                    slotProps={{
                      input: {
                        startAdornment: <Typography variant="body2" color="textSecondary">{`{{1}}`}</Typography>,
                      },
                    }}
                    onChange={(event) => setFieldValue('sampleSuffix', event.target.value)}
                    value={sampleSuffix}
                  />
                </FormControl>
              </div>
            )}
          </div>
          <div className={styles.Button}>
            {templateButtons.length === index + 1 && templateButtons.length !== 2
              ? addButton(arrayHelpers, true)
              : null}
          </div>
        </Fragment>
      );
    }

    if (templateType === QUICK_REPLY) {
      template = (
        <>
          <div className={styles.QuickReplyWrapper} key={index.toString()} data-testid="quickReplyWrapper">
            <FormControl fullWidth error={isError('value')} className={styles.FormControl}>
              <TextField
                disabled={disabled}
                value={value}
                title={title}
                label={`Quick reply ${index + 1} title`}
                variant="outlined"
                onChange={(e: any) => onInputChange(e, row, index, 'value')}
                className={styles.TextField}
                error={isError('value')}
                slotProps={{
                  input: {
                    endAdornment: templateButtons.length > 1 && !disabled && (
                      <CrossIcon
                        className={styles.RemoveIcon}
                        title="Remove"
                        data-testid="cross-icon"
                        onClick={() => handleRemoveClick(arrayHelpers, index)}
                      />
                    ),
                  },
                }}
              />
              {errors.templateButtons && touched.templateButtons && touched.templateButtons[index] ? (
                <FormHelperText>{errors.templateButtons[index]?.value}</FormHelperText>
              ) : null}
            </FormControl>
          </div>
          <div>
            {templateButtons.length === index + 1 && templateButtons.length !== 3 ? addButton(arrayHelpers) : null}
          </div>
        </>
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
        value={values?.templateType}
        onChange={handleTemplateTypeChange}
      >
        <div className={styles.RadioLabelWrapper}>
          <FormControlLabel
            value={CALL_TO_ACTION}
            control={<Radio color="primary" disabled={disabled} />}
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
            control={<Radio color="primary" disabled={disabled} />}
            label="Quick replies"
            className={styles.RadioLabel}
          />
          <Tooltip title={GUPSHUP_QUICK_REPLY} placement="right" tooltipClass={styles.Tooltip}>
            <InfoIcon />
          </Tooltip>
        </div>
      </RadioGroup>

      {templateType ? (
        <div className={styles.CallToActionTemplateFields}>
          <FieldArray
            name="templateButtons"
            render={(arrayHelpers: any) => (
              <div className={styles.QuickReplyContainer}>
                {templateButtons.map((row: any, index: any) => (
                  <div key={index}> {getButtons(row, index, arrayHelpers)}</div>
                ))}
              </div>
            )}
          />
        </div>
      ) : null}
    </div>
  );

  return <div>{isAddButtonChecked && radioTemplateType}</div>;
};
