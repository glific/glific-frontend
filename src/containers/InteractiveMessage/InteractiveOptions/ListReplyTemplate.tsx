import React from 'react';
import { Button, TextField, FormHelperText, FormControl } from '@material-ui/core';
import { FieldArray } from 'formik';

import styles from './InteractiveOptions.module.css';
import { ReactComponent as DeleteIcon } from '../../../assets/images/icons/Delete/Red.svg';

export interface ListReplyTemplateProps {
  index: number;
  inputFields: any;
  form: { touched: any; errors: any; values: any };
  onListAddClick: any;
  onListRemoveClick: any;
  onListItemAddClick: any;
  onListItemRemoveClick: any;
  onInputChange: any;
}

export const ListReplyTemplate: React.SFC<ListReplyTemplateProps> = (props) => {
  const {
    index,
    inputFields,
    form: { touched, errors, values },
    onListAddClick,
    onListRemoveClick,
    onListItemAddClick,
    onListItemRemoveClick,
    onInputChange,
  } = props;

  const isError = (key: string, itemIdx: number | null = null) => {
    if (itemIdx !== null) {
      return !!(
        errors.templateButtons &&
        touched.templateButtons &&
        errors.templateButtons[index] &&
        errors.templateButtons[index].options[itemIdx]?.[key]
      );
    }

    return !!(
      errors.templateButtons &&
      touched.templateButtons &&
      errors.templateButtons[index] &&
      errors.templateButtons[index][key]
    );
  };

  const sectionLabel = `Section ${index + 1}`;
  const sectionPlaceholder = `Section ${index + 1} title`;

  const { templateButtons } = values;
  const { options } = templateButtons[index];

  if (!options) {
    return null;
  }

  const err = errors.templateButtons && errors.templateButtons[index];
  if (err && err.options?.length !== options.length) {
    return null;
  }

  const showDeleteIcon = inputFields[index]?.options.length > 1;

  const handleAddListItem = (helper: any) => {
    helper.push({ title: '', description: '' });
    onListItemAddClick(options);
  };

  const handleRemoveListItem = (helper: any, idx: number) => {
    helper.remove(idx);
    onListItemRemoveClick(idx);
  };

  const handleInputChange = (
    event: any,
    key: string,
    itemIndex: number | null = null,
    isOption: boolean = false
  ) => {
    const { value } = event.target;
    const payload = { key, itemIndex, isOption };
    onInputChange(value, payload);
  };

  return (
    <div className={styles.WrapperBackground} key={index.toString()}>
      <div className={styles.QuickReplyWrapper}>
        <FormControl fullWidth error={isError('title')} className={styles.FormControl}>
          <TextField
            label={sectionLabel}
            placeholder={sectionPlaceholder}
            variant="outlined"
            onBlur={(e: any) => handleInputChange(e, 'title')}
            className={styles.TextField}
            error={isError('title')}
          />
          {errors.templateButtons && touched.templateButtons && touched.templateButtons[index] ? (
            <FormHelperText>{errors.templateButtons[index]?.title}</FormHelperText>
          ) : null}
        </FormControl>
        <div>{inputFields.length > 1 ? <DeleteIcon onClick={onListRemoveClick} /> : null}</div>
        <div>
          <FieldArray
            name={`templateButtons[${index}].options`}
            render={(arrayHelpers) =>
              options.map((itemRow: any, itemIndex: any) => (
                <div>
                  <div className={styles.WrapperBackground} key={itemIndex.toString()}>
                    <div className={styles.CallToActionWrapper}>
                      <div>
                        <div className={styles.TextFieldWrapper}>
                          <FormControl
                            fullWidth
                            error={isError('title', itemIndex)}
                            className={styles.FormControl}
                          >
                            <TextField
                              placeholder={`Title ${itemIndex + 1}`}
                              variant="outlined"
                              label={`Title ${itemIndex + 1}`}
                              onBlur={(e: any) => handleInputChange(e, 'title', itemIndex, true)}
                              className={styles.TextField}
                              error={isError('title', itemIndex)}
                            />
                            {isError('title', itemIndex) ? (
                              <FormHelperText>
                                {errors.templateButtons[index].options[itemIndex].title}
                              </FormHelperText>
                            ) : null}
                          </FormControl>
                        </div>
                      </div>
                      <div className={styles.TextFieldWrapper}>
                        <FormControl
                          fullWidth
                          error={isError('description', itemIndex)}
                          className={styles.FormControl}
                        >
                          <TextField
                            placeholder={`Description ${itemIndex + 1}`}
                            variant="outlined"
                            label={`Description ${itemIndex + 1}`}
                            onBlur={(e: any) =>
                              handleInputChange(e, 'description', itemIndex, true)
                            }
                            className={styles.TextField}
                            error={isError('description', itemIndex)}
                          />
                          {isError('description', itemIndex) ? (
                            <FormHelperText>
                              {errors.templateButtons[index].options[itemIndex].description}
                            </FormHelperText>
                          ) : null}
                        </FormControl>
                      </div>
                    </div>
                    <div>
                      {showDeleteIcon ? (
                        <DeleteIcon onClick={() => handleRemoveListItem(arrayHelpers, itemIndex)} />
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <Button variant="outlined" color="primary" onClick={onListAddClick}>
                      Add another list
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleAddListItem(arrayHelpers)}
                    >
                      Add another list item
                    </Button>
                  </div>
                </div>
              ))
            }
          />
        </div>
      </div>
    </div>
  );
};
