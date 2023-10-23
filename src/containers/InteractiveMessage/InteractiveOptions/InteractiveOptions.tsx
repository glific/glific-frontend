import {
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  TextField,
  FormHelperText,
} from '@mui/material';
import { FieldArray } from 'formik';

import ApprovedIcon from 'assets/images/icons/Template/Approved.svg?react';
import { QUICK_REPLY, LIST } from 'common/constants';
import { QuickReplyTemplate } from './QuickReplyTemplate';
import { ListReplyTemplate } from './ListReplyTemplate';
import styles from './InteractiveOptions.module.css';

export interface InteractiveOptionsProps {
  isAddButtonChecked: boolean;
  templateType: string | null;
  inputFields: Array<any>;
  form: { touched: any; errors: any; values: any; setFieldValue: any };
  onAddClick: any;
  onRemoveClick: any;
  onInputChange: any;
  onTemplateTypeChange: any;
  onListItemAddClick: any;
  onListItemRemoveClick: any;
  onGlobalButtonInputChange: any;
  disabled: any;
  translation?: any;
  disabledType?: any;
}
export const InteractiveOptions = ({
  isAddButtonChecked,
  templateType,
  inputFields,
  form,
  onAddClick,
  onRemoveClick,
  onTemplateTypeChange,
  onInputChange,
  onGlobalButtonInputChange,
  onListItemAddClick,
  onListItemRemoveClick,
  disabled = false,
  translation,
  disabledType,
}: InteractiveOptionsProps) => {
  const { values, errors, touched, setFieldValue } = form;

  const handleAddClick = (helper: any, type: string) => {
    const obj = type === LIST ? { title: '', options: [] } : { value: '' };
    helper.push(obj);
    onAddClick(true, type);
  };

  const handleRemoveClick = (helper: any, idx: number) => {
    helper.remove(idx);
    onRemoveClick(idx);
  };

  const getButtons = (index: number, arrayHelpers: any) => {
    let template: any = null;
    if (templateType === LIST) {
      template = (
        <ListReplyTemplate
          translation={translation && translation.items[index]}
          key={index}
          index={index}
          inputFields={inputFields}
          form={form}
          onListAddClick={() => handleAddClick(arrayHelpers, LIST)}
          onListRemoveClick={() => handleRemoveClick(arrayHelpers, index)}
          onListItemAddClick={(options: Array<any>) => onListItemAddClick(index, options)}
          onListItemRemoveClick={(itemIndex: number) => onListItemRemoveClick(index, itemIndex)}
          onInputChange={(value: string, payload: any) =>
            onInputChange(LIST, index, value, payload, setFieldValue)
          }
        />
      );
    }

    if (templateType === QUICK_REPLY) {
      template = (
        <QuickReplyTemplate
          translation={translation && translation[index]}
          key={index}
          index={index}
          inputFields={inputFields}
          form={form}
          onInputChange={(value: string, payload: any) =>
            onInputChange(QUICK_REPLY, index, value, payload, setFieldValue)
          }
          onAddClick={() => handleAddClick(arrayHelpers, QUICK_REPLY)}
          onRemoveClick={() => handleRemoveClick(arrayHelpers, index)}
        />
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
        className={styles.RadioGroupDisplay}
      >
        <div className={styles.RadioLabelWrapper}>
          <FormControlLabel
            value={QUICK_REPLY}
            control={
              <Radio
                disabled={disabledType}
                color="primary"
                checkedIcon={<ApprovedIcon className={styles.CheckedIcon} />}
                size="small"
              />
            }
            className={templateType === QUICK_REPLY ? styles.SelectedLabel : ''}
            classes={{ root: styles.RadioLabel }}
            label="Reply buttons"
          />
        </div>
        <div className={styles.RadioLabelWrapper}>
          <FormControlLabel
            value={LIST}
            control={
              <Radio
                disabled={disabledType}
                color="primary"
                checkedIcon={<ApprovedIcon className={styles.CheckedIcon} />}
                size="small"
              />
            }
            className={templateType === LIST ? styles.SelectedLabel : ''}
            classes={{ root: styles.RadioLabel }}
            label="List message"
          />
        </div>
      </RadioGroup>
      {templateType && templateType === LIST && (
        <div className={styles.GlobalButton}>
          {translation && <div className={styles.Translation}>{translation.globalButton}</div>}
          <FormControl
            fullWidth
            error={!!(errors.globalButton && touched.globalButton)}
            className={styles.FormControl}
          >
            <TextField
              placeholder="List header"
              variant="outlined"
              label="List header*"
              className={styles.TextField}
              onChange={(e: any) => {
                setFieldValue('globalButton', e.target.value);
                onGlobalButtonInputChange(e.target.value);
              }}
              value={values.globalButton}
              error={!!errors.globalButton && touched.globalButton}
            />
            {errors.globalButton && touched.globalButton && (
              <FormHelperText>{errors.globalButton}</FormHelperText>
            )}
          </FormControl>
        </div>
      )}

      {templateType && (
        <div className={templateType === QUICK_REPLY ? styles.TemplateFields : ''}>
          <FieldArray
            name="templateButtons"
            render={(arrayHelpers: any) =>
              values.templateButtons.map((row: any, index: any) => getButtons(index, arrayHelpers))
            }
          />
        </div>
      )}
    </div>
  );

  return <div>{isAddButtonChecked && !disabled && radioTemplateType}</div>;
};
