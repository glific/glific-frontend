import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { FieldArray } from 'formik';
import {
  TextField,
  FormHelperText,
  FormControl,
  Autocomplete,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { Button } from 'components/UI/Form/Button/Button';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import { CALL_TO_ACTION, QUICK_REPLY, WHATSAPP_FORM } from 'common/constants';
import { GET_WHATSAPP_FORM_DEFINITIONS } from 'graphql/queries/WhatsAppForm';
import styles from './TemplateOptionsV2.module.css';

export interface TemplateOptionsV2Props {
  isAddButtonChecked: boolean;
  templateType: any;
  inputFields: Array<any>;
  form: { touched: any; errors: any; values: any; setFieldValue: any };
  onAddClick: any;
  onRemoveClick: any;
  onInputChange: any;
  disabled: any;
  onDynamicParamsChange: any;
}

const callToActionTypeOptions: Array<{ id: string; label: string; icon: any }> = [
  { id: 'url', label: 'URL', icon: <LinkOutlinedIcon /> },
  { id: 'phone_number', label: 'Phone number', icon: <CallOutlinedIcon /> },
];

const QUICK_REPLY_MAX_LENGTH = 20;

export const TemplateOptionsV2 = ({
  isAddButtonChecked,
  templateType,
  inputFields,
  form: { touched, errors },
  onAddClick,
  onRemoveClick,
  onInputChange,
  disabled = false,
  onDynamicParamsChange,
}: TemplateOptionsV2Props) => {
  const [forms, setForms] = useState<any>([]);
  const [screens, setScreens] = useState<any>([]);
  const [advancedOpenRows, setAdvancedOpenRows] = useState<Record<number, boolean>>({});

  useQuery(GET_WHATSAPP_FORM_DEFINITIONS, {
    variables: {
      filter: { status: 'PUBLISHED' },
    },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      setForms(
        data.listWhatsappForms.map((form: any) => ({
          label: form?.name,
          id: form?.metaFlowId,
          definition: form?.revision?.definition,
        }))
      );
    },
  });

  const handleAddClick = (helper: any, type: boolean) => {
    const obj = type ? { type: '', value: '', title: '', url_type: '', sampleSuffix: '' } : { value: '' };
    helper.push(obj);
    onAddClick();
  };

  const handleRemoveClick = (helper: any, idx: number) => {
    helper.remove(idx);
    onRemoveClick(idx);
  };

  const toggleAdvanced = (index: number) => {
    setAdvancedOpenRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const urlCount = inputFields.filter((field) => field.type === 'url').length;
  const phoneNumberCount = inputFields.filter((field) => field.type === 'phone_number').length;

  const addButton = (helper: any, type: boolean = false, label: string) => (
    <Button
      variant="contained"
      color="primary"
      className={styles.AddButton}
      startIcon={<AddIcon />}
      data-testid="addButton"
      onClick={() => handleAddClick(helper, type)}
      disabled={disabled}
    >
      {label}
    </Button>
  );

  const getButtons = (row: any, index: number, arrayHelpers: any) => {
    const urlType = row?.urlType || 'Static';
    const sampleSuffix = row?.sampleSuffix || '';

    const { type, title, value, navigate_screen, text, form_id }: any = row ?? {};

    const isError = (key: string) =>
      !!(
        errors.templateButtons &&
        touched.templateButtons &&
        errors.templateButtons[index] &&
        errors.templateButtons[index][key]
      );

    if (templateType?.id === CALL_TO_ACTION) {
      const isPhoneNumberType = type === 'phone_number';
      const titlePlaceholder = isPhoneNumberType ? 'e.g., Call Us' : 'e.g., Track Order';
      const valueFieldLabel = isPhoneNumberType ? 'Phone number' : 'URL';
      const valuePlaceholder = isPhoneNumberType ? '+91 98765 43210' : 'https://example.com';
      const isAdvancedOpen = Boolean(advancedOpenRows[index]);

      return (
        <div className={styles.ButtonCard}>
          <div className={styles.ButtonCardHeader}>
            <div className={styles.ChipRow}>
              {callToActionTypeOptions.map((option) => {
                const isSelected = type === option.id;
                const isOptionDisabled =
                  disabled ||
                  (option.id === 'phone_number' && phoneNumberCount >= 1) ||
                  (option.id === 'url' && urlCount >= 2);
                return (
                  <Button
                    key={option.id}
                    className={`${styles.Chip} ${isSelected ? styles.ChipSelected : ''}`}
                    disabled={isOptionDisabled}
                    onClick={() => onInputChange(option.id, row, index, 'type')}
                  >
                    <span className={styles.ChipIcon}>{option.icon}</span>
                    <span className={styles.ChipLabel}>{option.label}</span>
                  </Button>
                );
              })}
            </div>
            {inputFields.length > 1 && (
              <DeleteIcon
                className={styles.DeleteIcon}
                onClick={() => handleRemoveClick(arrayHelpers, index)}
                data-testid="delete-icon"
              />
            )}
          </div>
          {errors.templateButtons && touched.templateButtons && touched.templateButtons[index]?.type ? (
            <FormHelperText error>{errors.templateButtons[index]?.type}</FormHelperText>
          ) : null}

          <div className={styles.FieldsRow}>
            <div className={styles.Field} data-testid="buttonTitle">
              <p className={styles.FieldLabel}>Button label</p>
              <FormControl fullWidth error={isError('title')}>
                <TextField
                  disabled={disabled}
                  value={title}
                  placeholder={titlePlaceholder}
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
            <div className={styles.Field} data-testid="buttonValue">
              <p className={styles.FieldLabel}>{valueFieldLabel}</p>
              <FormControl fullWidth error={isError('value')}>
                <TextField
                  value={value}
                  disabled={disabled}
                  placeholder={valuePlaceholder}
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
          </div>

          {type === 'url' && (
            <>
              <Button className={styles.AdvancedToggle} onClick={() => toggleAdvanced(index)} disabled={disabled}>
                <ExpandMoreIcon className={isAdvancedOpen ? styles.AdvancedIconOpen : ''} />
                Advanced
              </Button>
              {isAdvancedOpen && (
                <div className={styles.AdvancedSection}>
                  <RadioGroup
                    row
                    aria-label="url-type"
                    name={`url-type-${index}`}
                    value={urlType}
                    onChange={(e: any) => onDynamicParamsChange({ urlType: e.target.value }, index)}
                  >
                    <FormControlLabel
                      value="Static"
                      control={<Radio color="primary" disabled={disabled} />}
                      label="Static URL"
                    />
                    <FormControlLabel
                      value="Dynamic"
                      control={<Radio color="primary" disabled={disabled} />}
                      label={
                        <>
                          Dynamic URL <span className={styles.RadioHint}>(variable appended at send time)</span>
                        </>
                      }
                    />
                  </RadioGroup>
                  {urlType === 'Dynamic' && (
                    <TextField
                      placeholder="Sample Suffix"
                      disabled={disabled}
                      label="Sample Suffix"
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
                      onChange={(event) => onDynamicParamsChange({ sampleSuffix: event.target.value }, index)}
                      value={sampleSuffix}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    if (templateType?.id === QUICK_REPLY) {
      return (
        <div className={styles.QuickReplyRow} data-testid="quickReplyWrapper">
          <FormControl fullWidth error={isError('value')}>
            <TextField
              disabled={disabled}
              value={value}
              placeholder="e.g., Yes, No, More Info"
              variant="outlined"
              onChange={(e: any) => onInputChange(e.target.value, row, index, 'value')}
              className={styles.TextField}
              error={isError('value')}
              slotProps={{
                htmlInput: { maxLength: QUICK_REPLY_MAX_LENGTH },
              }}
            />
            <div className={styles.CharCount}>
              {(value || '').length} / {QUICK_REPLY_MAX_LENGTH}
            </div>
            {errors.templateButtons && touched.templateButtons && touched.templateButtons[index] ? (
              <FormHelperText>{errors.templateButtons[index]?.value}</FormHelperText>
            ) : null}
          </FormControl>
          {inputFields.length > 1 && (
            <DeleteIcon
              className={styles.DeleteIcon}
              onClick={() => handleRemoveClick(arrayHelpers, index)}
              data-testid="delete-icon"
            />
          )}
        </div>
      );
    }

    if (templateType?.id === WHATSAPP_FORM) {
      return (
        <div className={styles.WhatsAppFormRow}>
          <div className={styles.Field}>
            <p className={styles.FieldLabel}>Select Form*</p>
            <Autocomplete
              options={forms}
              value={forms.find((form: any) => form.id === form_id) || null}
              renderInput={(params) => <TextField {...params} placeholder="Select a form" />}
              onChange={(event: any, newValue: any) => {
                onInputChange(newValue.id, row, index, 'form_id');
                try {
                  const definition = JSON.parse(newValue.definition);
                  const screenNames = definition.screens.map((screen: any) => screen.id);
                  if (screenNames.length) {
                    setScreens([{ label: screenNames[0], id: screenNames[0] }]);
                  }
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

          <div className={styles.Field}>
            <p className={styles.FieldLabel}>Screen Name*</p>
            <Autocomplete
              options={screens}
              value={navigate_screen}
              renderInput={(params) => <TextField {...params} placeholder="e.g., contact_us" />}
              onChange={(event: any, newValue: any) => {
                onInputChange(newValue.id, row, index, 'navigate_screen');
              }}
              disabled={disabled || !form_id}
            />
            {errors.templateButtons && touched.templateButtons && touched.templateButtons[index] ? (
              <p className={styles.Errors}>{errors.templateButtons[index]?.navigate_screen}</p>
            ) : null}
          </div>

          <div className={styles.Field}>
            <p className={styles.FieldLabel}>Button Title*</p>
            <TextField
              value={text}
              placeholder="e.g., Fill Form"
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

    return null;
  };

  if (!isAddButtonChecked || !templateType) {
    return null;
  }

  return (
    <FieldArray
      name="templateButtons"
      render={(arrayHelpers: any) => (
        <div className={styles.Container}>
          {templateType.id === CALL_TO_ACTION && (
            <p className={styles.HintText}>Up to 2 URL buttons + 1 phone number button per template</p>
          )}
          {templateType.id === QUICK_REPLY && (
            <p className={styles.HintText}>Maximum 10 quick reply buttons allowed per template</p>
          )}

          {inputFields.map((row: any, index: any) => (
            <div key={index}>{getButtons(row, index, arrayHelpers)}</div>
          ))}

          {templateType.id === CALL_TO_ACTION && inputFields.length < 3 && addButton(arrayHelpers, true, 'Add Button')}
          {templateType.id === QUICK_REPLY &&
            inputFields.length < 10 &&
            addButton(arrayHelpers, false, 'Add Quick Reply Button')}
        </div>
      )}
    />
  );
};

export default TemplateOptionsV2;
