import { Button, TextField, FormHelperText, FormControl } from '@mui/material';
import { FieldArray } from 'formik';
import { useTranslation } from 'react-i18next';

import { ReactComponent as DeleteIcon } from 'assets/images/icons/Delete/Red.svg';
import { ReactComponent as CrossIcon } from 'assets/images/icons/Cross.svg';
import { ReactComponent as AddIcon } from 'assets/images/icons/SquareAdd.svg';
import styles from './ListReplyTemplate.module.css';

export interface ListReplyTemplateProps {
  index: number;
  inputFields: any;
  form: { touched: any; errors: any; values: any };
  onListAddClick: any;
  onListRemoveClick: any;
  onListItemAddClick: any;
  onListItemRemoveClick: any;
  onInputChange: any;
  translation?: any;
}

export const ListReplyTemplate = ({
  index,
  inputFields,
  form: { touched, errors, values },
  onListAddClick,
  onListRemoveClick,
  onListItemAddClick,
  onListItemRemoveClick,
  onInputChange,
  translation,
}: ListReplyTemplateProps) => {
  const { t } = useTranslation();

  const isError = (key: string, itemIdx: number) => {
    const error =
      errors.templateButtons &&
      touched.templateButtons &&
      errors.templateButtons[index] &&
      touched.templateButtons[index] &&
      errors.templateButtons[index].options &&
      touched.templateButtons[index].options &&
      errors.templateButtons[index].options[itemIdx] &&
      errors.templateButtons[index].options[itemIdx][key];

    return !!error;
  };

  const isListTitleError = (() => {
    const error =
      errors.templateButtons &&
      touched.templateButtons &&
      errors.templateButtons[index] &&
      touched.templateButtons[index] &&
      errors.templateButtons[index].title;

    return !!error;
  })();

  const sectionLabel = `Enter list ${index + 1} title*`;

  const { templateButtons } = values;
  const { options } = templateButtons[index];

  if (!options) {
    return null;
  }

  const showDeleteIcon = inputFields[index]?.options && inputFields[index]?.options.length > 1;
  const defaultTitle = inputFields[index]?.title;

  const isAddMoreOptionAllowed = inputFields.reduce((result: number, field: any) => {
    const { options: optn } = field;
    return result + (optn ? optn.length : 0);
  }, 0);

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
      <div className={styles.Section}>
        <div>List {index + 1}</div>
        <div>
          {inputFields.length > 1 && (
            <DeleteIcon
              title="Remove"
              data-testid="delete-icon"
              className={styles.ListDeleteIcon}
              onClick={onListRemoveClick}
            />
          )}
        </div>
      </div>

      <div className={styles.ListReplyWrapper}>
        {translation && <div className={styles.Translation}>{translation.title}</div>}
        <FormControl fullWidth error={isListTitleError} className={styles.FormControl}>
          <TextField
            label={sectionLabel}
            placeholder={`List ${index + 1} title (Max 24 char.)`}
            variant="outlined"
            onChange={(e: any) => handleInputChange(e, 'title')}
            className={styles.TextField}
            error={isListTitleError}
            value={defaultTitle}
          />
          {errors.templateButtons && touched.templateButtons && touched.templateButtons[index] ? (
            <FormHelperText>{errors.templateButtons[index]?.title}</FormHelperText>
          ) : null}
        </FormControl>

        <div>
          <FieldArray
            name={`templateButtons[${index}].options`}
            render={(arrayHelpers) =>
              options.map((itemRow: any, itemIndex: any) => (
                // disabling eslint for this as we have no other unique way to define a key
                // eslint-disable-next-line react/no-array-index-key
                <div key={itemIndex}>
                  <div className={styles.ListReplyItemWrapper}>
                    <div className={styles.ListReplyItemContent}>
                      <div className={styles.TextFieldWrapper}>
                        {translation?.options && translation.options.length > itemIndex && (
                          <div className={styles.Translation}>
                            {translation.options[itemIndex].title}
                          </div>
                        )}
                        <FormControl
                          fullWidth
                          error={isError('title', itemIndex)}
                          className={styles.FormControl}
                        >
                          <TextField
                            placeholder={`Title ${itemIndex + 1} (Max 24 char.)`}
                            variant="outlined"
                            label={`Enter list item ${itemIndex + 1} title*`}
                            onChange={(e: any) => handleInputChange(e, 'title', itemIndex, true)}
                            className={styles.TextField}
                            error={isError('title', itemIndex)}
                            value={itemRow.title}
                            InputProps={{
                              endAdornment: itemIndex !== 0 && showDeleteIcon && (
                                <CrossIcon
                                  title="Remove"
                                  data-testid="cross-icon"
                                  className={styles.ListDeleteIcon}
                                  onClick={() => handleRemoveListItem(arrayHelpers, itemIndex)}
                                />
                              ),
                            }}
                          />
                          {isError('title', itemIndex) && (
                            <FormHelperText className={styles.HelperText}>
                              {errors.templateButtons[index].options[itemIndex].title}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </div>

                      <div className={styles.TextFieldWrapper}>
                        {translation?.options &&
                          translation.options.length > itemIndex &&
                          translation.options[itemIndex].description && (
                            <div className={styles.Translation}>
                              {translation.options[itemIndex].description}
                            </div>
                          )}
                        <FormControl
                          fullWidth
                          error={isError('description', itemIndex)}
                          className={styles.FormControl}
                        >
                          <TextField
                            placeholder={`Description ${itemIndex + 1} (Max 60 char.)`}
                            variant="outlined"
                            label={`Enter list item ${itemIndex + 1} description`}
                            onChange={(e: any) =>
                              handleInputChange(e, 'description', itemIndex, true)
                            }
                            className={styles.TextField}
                            error={isError('description', itemIndex)}
                            value={itemRow.description}
                          />
                          {isError('description', itemIndex) ? (
                            <FormHelperText>
                              {errors.templateButtons[index].options[itemIndex].description}
                            </FormHelperText>
                          ) : null}
                        </FormControl>
                      </div>
                    </div>
                  </div>
                  <div className={styles.ActionButtons}>
                    {isAddMoreOptionAllowed < 10 &&
                      inputFields.length === index + 1 &&
                      options.length === itemIndex + 1 && (
                        <Button
                          color="primary"
                          className={styles.AddButton}
                          onClick={onListAddClick}
                          startIcon={<AddIcon className={styles.AddIcon} />}
                        >
                          {t('Add another list')}
                        </Button>
                      )}
                    {isAddMoreOptionAllowed < 10 && options.length === itemIndex + 1 && (
                      <Button
                        color="primary"
                        className={styles.AddButton}
                        onClick={() => handleAddListItem(arrayHelpers)}
                        startIcon={<AddIcon className={styles.AddIcon} />}
                      >
                        {t('Add another list item')}
                      </Button>
                    )}
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
