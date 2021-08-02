import React, { useState, useEffect } from 'react';
import { FormControl } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import styles from './SearchDialogBox.module.css';

export interface SearchDialogBoxProps {
  title: string;
  handleOk: Function;
  handleCancel: Function;
  options: any;
  selectedOptions: any;
  icon?: any;
  optionLabel?: string;
  additionalOptionLabel?: string;
  onChange?: any;
  asyncSearch?: boolean;
  disableClearable?: boolean;
  searchLabel?: string;
  renderTags?: boolean;
  textFieldPlaceholder?: any;
}

export const SearchDialogBox = (props: SearchDialogBoxProps) => {
  const {
    asyncSearch,
    icon,
    options,
    selectedOptions,
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
  } = props;

  const [selectedOption, setSelectedOptions] = useState<Array<string>>([]);
  const [asyncSelectedOptions, setAsyncSelectedOptions] = useState<Array<any>>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (!asyncSearch) {
      setSelectedOptions(options.filter((option: any) => selectedOptions.includes(option.id)));
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

  const selectedOptionsIds = selectedOptions.map(({ id }: { id: any }) => id);

  return (
    <DialogBox
      title={title}
      handleOk={() =>
        handleOk(
          asyncSearch
            ? asyncSelectedOptions.map((option: any) => option.id)
            : selectedOption.map((option: any) => option.id)
        )
      }
      handleCancel={handleCancel}
      titleAlign="left"
      buttonOk={t('Save')}
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
          />
        </FormControl>
      </div>
    </DialogBox>
  );
};
