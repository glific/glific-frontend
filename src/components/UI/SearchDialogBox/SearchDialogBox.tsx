import { useState, useEffect } from 'react';
import { FormControl } from '@material-ui/core';

import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import styles from './SearchDialogBox.module.css';

export interface SearchDialogBoxProps {
  title: string;
  handleOk: Function;
  handleCancel: Function;
  options: any;
  selectedOptions?: any;
  icon?: any;
  optionLabel?: string;
  additionalOptionLabel?: string;
  onChange?: any;
  asyncSearch?: boolean;
  disableClearable?: boolean;
  searchLabel?: string;
  renderTags?: boolean;
  textFieldPlaceholder?: any;
  multiple?: boolean;
  buttonOk?: string;
  description?: string;
}

export const SearchDialogBox = (props: SearchDialogBoxProps) => {
  const {
    asyncSearch,
    icon,
    options,
    selectedOptions = null,
    title,
    handleOk,
    optionLabel,
    additionalOptionLabel,
    handleCancel,
    onChange,
    disableClearable,
    searchLabel = 'Search',
    renderTags = true,
    textFieldPlaceholder = '',
    multiple = true,
    buttonOk = 'Save',
    description = '',
  } = props;

  const [selectedOption, setSelectedOptions] = useState<any>(multiple ? [] : '');
  const [asyncSelectedOptions, setAsyncSelectedOptions] = useState<Array<any>>([]);

  useEffect(() => {
    if (!asyncSearch) {
      setSelectedOptions(
        multiple
          ? options.filter((option: any) => selectedOptions.includes(option.id))
          : selectedOptions
      );
    }
  }, [selectedOptions, options]);

  useEffect(() => {
    if (asyncSearch === true) {
      setAsyncSelectedOptions(selectedOptions);
    }
  }, [selectedOptions]);

  const changeValue = (event: any, value: any) => {
    setSelectedOptions(value);
  };

  const selectedOptionsIds = multiple
    ? selectedOptions.map(({ id }: { id: any }) => id)
    : selectedOptions?.id;

  const getIds = multiple ? selectedOption?.map((option: any) => option.id) : selectedOption?.id;

  return (
    <DialogBox
      title={title}
      handleOk={() =>
        handleOk(asyncSearch ? asyncSelectedOptions.map((option: any) => option.id) : getIds)
      }
      handleCancel={handleCancel}
      titleAlign="left"
      buttonOk={buttonOk}
    >
      <div className={styles.DialogBox}>
        <FormControl fullWidth>
          <AutoComplete
            disableClearable={disableClearable}
            asyncSearch={asyncSearch}
            asyncValues={{ value: asyncSelectedOptions, setValue: setAsyncSelectedOptions }}
            options={options}
            optionLabel={optionLabel || 'label'}
            additionalOptionLabel={additionalOptionLabel}
            field={{ value: selectedOption }}
            onChange={(value: any) => {
              if (onChange) {
                onChange(value);
              }
            }}
            form={{ setFieldValue: changeValue }}
            textFieldProps={{
              label: searchLabel,
              variant: 'outlined',
              placeholder: textFieldPlaceholder,
            }}
            chipIcon={icon}
            renderTags={renderTags}
            selectedOptionsIds={selectedOptionsIds}
            multiple={multiple}
          />
        </FormControl>
        <div className={styles.Description} data-testid="description">
          {description}
        </div>
      </div>
    </DialogBox>
  );
};
