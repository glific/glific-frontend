import React from 'react';
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  TextField,
  FormHelperText,
} from '@material-ui/core';
import { FieldArray } from 'formik';

import styles from './InteractiveOptions.module.css';
import { ReactComponent as ApprovedIcon } from '../../../assets/images/icons/Template/Approved.svg';
import { QUICK_REPLY, LIST } from '../../../common/constants';

import { QuickReplyTemplate } from './QuickReplyTemplate';
import { ListReplyTemplate } from './ListReplyTemplate';

export interface InteractiveOptionsProps {
  isAddButtonChecked: boolean;
  templateType: string | null;
  inputFields: Array<any>;
  form: { touched: any; errors: any; values: any };
  onAddClick: any;
  onRemoveClick: any;
  onInputChange: any;
  onTemplateTypeChange: any;
  onListItemAddClick: any;
  onListItemRemoveClick: any;
  onGlobalButtonInputChange: any;
  disabled: any;
}
export const InteractiveOptions: React.SFC<InteractiveOptionsProps> = ({
  isAddButtonChecked,
  templateType,
  inputFields,
  form,
  onAddClick,
  onRemoveClick,
  onTemplateTypeChange,
  onInputChange,
  onListItemAddClick,
  onListItemRemoveClick,
  onGlobalButtonInputChange,
  disabled = false,
}) => {
  const { values, errors, touched } = form;

  const handleAddClick = (helper: any, type: string) => {
    const obj = type === LIST ? { title: '', options: [] } : { value: '' };
    helper.push(obj);
    onAddClick(true, type);
  };

  const handleRemoveClick = (helper: any, idx: number) => {
    helper.remove(idx);
    onRemoveClick(idx);
  };

  const getButtons = (row: any, index: number, arrayHelpers: any) => {
    let template: any = null;
    const uniqueKey = `button_${new Date().getTime()}`;
    if (templateType === LIST) {
      template = (
        <ListReplyTemplate
          key={uniqueKey}
          index={index}
          inputFields={inputFields}
          form={form}
          onListAddClick={() => handleAddClick(arrayHelpers, LIST)}
          onListRemoveClick={() => handleRemoveClick(arrayHelpers, index)}
          onListItemAddClick={(options: Array<any>) => onListItemAddClick(index, options)}
          onListItemRemoveClick={(itemIndex: number) => onListItemRemoveClick(index, itemIndex)}
          onInputChange={(value: string, payload: any) =>
            onInputChange(LIST, index, value, payload)
          }
        />
      );
    }

    if (templateType === QUICK_REPLY) {
      template = (
        <QuickReplyTemplate
          key={index}
          index={index}
          inputFields={inputFields}
          form={form}
          onInputChange={(value: string, payload: any) =>
            onInputChange(QUICK_REPLY, index, value, payload)
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
      >
        <div className={styles.RadioLabelWrapper}>
          <FormControlLabel
            value={QUICK_REPLY}
            control={
              <Radio
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
          <FormControl
            fullWidth
            error={!!(errors.globalButton && touched.globalButton)}
            className={styles.FormControl}
          >
            <TextField
              placeholder="List header"
              variant="outlined"
              label="List header"
              className={styles.TextField}
              onChange={(e: any) => onGlobalButtonInputChange(e.target.value)}
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
        <FieldArray
          name="templateButtons"
          render={(arrayHelpers) =>
            values.templateButtons.map((row: any, index: any) =>
              getButtons(row, index, arrayHelpers)
            )
          }
        />
      )}
    </div>
  );

  return <div>{isAddButtonChecked && !disabled && radioTemplateType}</div>;
};
