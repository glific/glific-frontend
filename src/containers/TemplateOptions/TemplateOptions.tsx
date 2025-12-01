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
import {
  GUPSHUP_CALL_TO_ACTION,
  GUPSHUP_QUICK_REPLY,
  CALL_TO_ACTION,
  QUICK_REPLY,
  WHATSAPP_FORM,
  GUPSHUP_WHATSAPP_FORM,
  BUTTON_OPTIONS,
} from 'common/constants';
import styles from './TemplateOptions.module.css';
import { Fragment, useState } from 'react';
import { useQuery } from '@apollo/client';
import { LIST_WHATSAPP_FORMS } from 'graphql/queries/WhatsAppForm';
import { getOrganizationServices } from 'services/AuthService';

export interface TemplateOptionsProps {
  isAddButtonChecked: boolean;
  templateType: any;
  inputFields: Array<any>;
  form: { touched: any; errors: any; values: any; setFieldValue: any };
  onAddClick: any;
  onRemoveClick: any;
  onInputChange: any;
  onTemplateTypeChange: any;
  disabled: any;
  dynamicUrlParams: any;
  onDynamicParamsChange: any;
}

const getInfo = (type: string) => {
  switch (type) {
    case CALL_TO_ACTION:
      return GUPSHUP_CALL_TO_ACTION;
    case QUICK_REPLY:
      return GUPSHUP_QUICK_REPLY;
    case WHATSAPP_FORM:
      return GUPSHUP_WHATSAPP_FORM;
    default:
      return '';
  }
};

export const TemplateOptions = ({
  isAddButtonChecked,
  templateType,
  inputFields,
  form: { touched, errors },
  onAddClick,
  onRemoveClick,
  onTemplateTypeChange,
  onInputChange,
  disabled = false,
  dynamicUrlParams,
  onDynamicParamsChange,
}: TemplateOptionsProps) => {
  const buttonTitle = 'Button Title';
  const buttonValue = 'Button Value';
  const buttonTitles: any = {
    CALL_TO_ACTION: 'Call to action',
    QUICK_REPLY: 'Quick Reply',
  };
  const options = ['Static', 'Dynamic'];
  const [forms, setForms] = useState<any>([]);
  const { urlType, sampleSuffix } = dynamicUrlParams;
  const [screens, setScreens] = useState<any>([]);

  const isWhatsAppFormEnabled = getOrganizationServices('whatsappFormsEnabled');
  let buttonOptions = BUTTON_OPTIONS;
  if (!isWhatsAppFormEnabled) {
    buttonOptions = BUTTON_OPTIONS.filter((option: any) => option.id !== WHATSAPP_FORM);
  }

  useQuery(LIST_WHATSAPP_FORMS, {
    variables: {
      filter: { status: 'PUBLISHED' },
    },
    onCompleted: (data) => {
      setForms(
        data.listWhatsappForms.map((form: any) => ({
          label: form.name,
          id: form.metaFlowId,
          definition: form.definition,
        }))
      );
    },
  });

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
    const title = templateType ? buttonTitles[templateType?.id] : '';
    const buttonClass = templateType?.id === QUICK_REPLY ? styles.QuickReplyAddButton : styles.CallToActionAddButton;
    return (
      <Button
        className={buttonClass}
        variant="outlined"
        color="primary"
        data-testid="addButton"
        onClick={() => handleAddClick(helper, type)}
        disabled={disabled}
      >
        Add {title}
      </Button>
    );
  };

  const getButtons = (row: any, index: number, arrayHelpers: any) => {
    const { type, title, value, navigate_screen, text, form_id }: any = row;

    let template: any = null;

    const isError = (key: string) =>
      !!(
        errors.templateButtons &&
        touched.templateButtons &&
        errors.templateButtons[index] &&
        errors.templateButtons[index][key]
      );

    if (templateType?.id === CALL_TO_ACTION) {
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
                    onChange={(e: any) => onInputChange(e.target.value, row, index, 'type')}
                    className={styles.RadioGroup}
                  >
                    <FormControlLabel
                      value="phone_number"
                      control={
                        <Radio
                          color="primary"
                          disabled={
                            disabled ||
                            (index === 0 && inputFields.length > 1 && inputFields[0].type !== 'phone_number') ||
                            (index > 0 && inputFields[0].type && inputFields[0].type === 'phone_number')
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
                            (index === 0 && inputFields.length > 1 && inputFields[0].type !== 'url') ||
                            (index > 0 && inputFields[0].type && inputFields[0].type === 'url')
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
                {inputFields.length > 1 ? (
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
                    onDynamicParamsChange({
                      ...dynamicUrlParams,
                      urlType: newValue,
                    });
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
                  placeholder={buttonTitle}
                  variant="outlined"
                  onChange={(e: any) => onInputChange(e.target.value, row, index, 'title')}
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
                  placeholder={buttonValue}
                  variant="outlined"
                  onChange={(e: any) => onInputChange(e.target.value, row, index, 'value')}
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
                    placeholder="Sample Suffix"
                    disabled={disabled}
                    label={'Sample Suffix'}
                    className={styles.TextField}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            className={styles.StartAdornment}
                          >{`{{1}}`}</Typography>
                        ),
                      },
                    }}
                    onChange={(event) =>
                      onDynamicParamsChange({
                        ...dynamicUrlParams,
                        sampleSuffix: event.target.value,
                      })
                    }
                    value={sampleSuffix}
                  />
                </FormControl>
              </div>
            )}
          </div>

          <div className={styles.Button}>
            {inputFields.length === index + 1 && inputFields.length !== 2 ? addButton(arrayHelpers, true) : null}
          </div>
        </Fragment>
      );
    }

    if (templateType?.id === QUICK_REPLY) {
      template = (
        <>
          <div className={styles.QuickReplyWrapper} key={index.toString()} data-testid="quickReplyWrapper">
            <FormControl fullWidth error={isError('value')} className={styles.FormControl}>
              <TextField
                disabled={disabled}
                value={value}
                title={title}
                placeholder={`Quick reply ${index + 1} title`}
                variant="outlined"
                onChange={(e: any) => onInputChange(e.target.value, row, index, 'value')}
                className={styles.TextField}
                error={isError('value')}
                slotProps={{
                  input: {
                    endAdornment: inputFields.length > 1 && !disabled && (
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
          <div>{inputFields.length === index + 1 && inputFields.length !== 10 ? addButton(arrayHelpers) : null}</div>
        </>
      );
    }

    if (templateType?.id === WHATSAPP_FORM) {
      template = (
        <div className={styles.WhatsappFormTemplateWrapper}>
          <div>
            <Autocomplete
              options={forms}
              value={forms.find((form: any) => form.id === form_id) || null}
              renderInput={(params) => <TextField {...params} label="Select Form " />}
              onChange={(event: any, newValue: any) => {
                onInputChange(newValue.id, row, index, 'form_id');

                try {
                  const definition = JSON.parse(newValue.definition);
                  const screenNames = definition.screens.map((screen: any) => screen.id);
                  setScreens(screenNames.map((screen: string) => ({ label: screen, id: screen })));
                } catch (e) {
                  setScreens([]);
                  console.error('Error parsing form definition:', e);
                }
              }}
              disabled={disabled}
            />
            {errors.templateButtons && touched.templateButtons && touched.templateButtons[index] ? (
              <p className={styles.Errors}>{errors.templateButtons[index]?.form_id}</p>
            ) : null}
          </div>

          <div>
            <Autocomplete
              options={screens}
              value={navigate_screen}
              renderInput={(params) => <TextField {...params} label="Screen Name" />}
              onChange={(event: any, newValue: any) => {
                onInputChange(newValue.id, row, index, 'navigate_screen');
              }}
              disabled={disabled || !form_id}
            />

            {errors.templateButtons && touched.templateButtons && touched.templateButtons[index] ? (
              <p className={styles.Errors}>{errors.templateButtons[index]?.navigate_screen}</p>
            ) : null}
          </div>

          <div>
            <TextField
              value={text}
              title={title}
              placeholder={`Button Title`}
              variant="outlined"
              onChange={(e: any) => onInputChange(e.target.value, row, index, 'text')}
              className={styles.TextField}
              error={isError('value')}
              disabled={disabled}
            />
            {errors.templateButtons && touched.templateButtons && touched.templateButtons[index] ? (
              <p className={styles.Errors}>{errors.templateButtons[index]?.text}</p>
            ) : null}
          </div>
        </div>
      );
    }
    return template;
  };

  return (
    <>
      {isAddButtonChecked && (
        <div className={styles.TemplateOptionsContainer}>
          <div className={styles.TemplateOptionsHeader}>
            <Autocomplete
              options={buttonOptions}
              classes={{ inputRoot: styles.DefaultInputRoot }}
              renderInput={(params) => <TextField {...params} label="Select Button Type" />}
              value={templateType}
              onChange={(event: any, newValue: any) => {
                onTemplateTypeChange(newValue);
              }}
              fullWidth
              disabled={disabled}
              disableClearable
            />

            <Tooltip title={getInfo(templateType?.id)} placement="top">
              <InfoIcon />
            </Tooltip>
          </div>

          {templateType ? (
            <div className={styles.CallToActionTemplateFields}>
              <FieldArray
                name="templateButtons"
                render={(arrayHelpers: any) => (
                  <div className={styles.QuickReplyContainer}>
                    {inputFields.map((row: any, index: any) => (
                      <div key={index}> {getButtons(row, index, arrayHelpers)}</div>
                    ))}
                  </div>
                )}
              />
            </div>
          ) : null}
        </div>
      )}
    </>
  );
};
