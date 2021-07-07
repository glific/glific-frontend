/* eslint-disable */
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

import styles from './InteractiveOptions.module.css';
import { Button } from '../../../components/UI/Form/Button/Button';
import Tooltip from '../../../components/UI/Tooltip/Tooltip';
import { ReactComponent as DeleteIcon } from '../../../assets/images/icons/Delete/Red.svg';
import { ReactComponent as InfoIcon } from '../../../assets/images/icons/Info.svg';
import {
  GUPSHUP_CALL_TO_ACTION,
  GUPSHUP_QUICK_REPLY,
  QUICK_REPLY,
  LIST,
} from '../../../common/constants';

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
  disabled = false,
}) => {
  const { values } = form;
  const handleAddClick = (helper: any, type: string) => {
    const obj = type === LIST ? { title: '', options: [] } : { value: '' };
    helper.push(obj);
    onAddClick(true);
  };

  const handleRemoveClick = (helper: any, idx: number) => {
    helper.remove(idx);
    onRemoveClick(idx);
  };

  const getButtons = (row: any, index: number, arrayHelpers: any) => {
    let template: any = null;
    if (templateType === LIST) {
      template = (
        <ListReplyTemplate
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
            value={LIST}
            control={<Radio color="primary" />}
            label="List"
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
        <FieldArray
          name="templateButtons"
          render={(arrayHelpers) =>
            values.templateButtons.map((row: any, index: any) =>
              getButtons(row, index, arrayHelpers)
            )
          }
        />
      ) : null}
    </div>
  );

  return <div>{isAddButtonChecked && !disabled ? radioTemplateType : null}</div>;
};
