import React, { useState, useEffect } from 'react';
import { TwitterPicker } from 'react-color';

import { Input, ClickAwayListener, FormHelperText } from '@mui/material';
import { useTranslation } from 'react-i18next';

import styles from './ColorPicker.module.css';

export interface ColorPickerProps {
  colorCode: string;
  name: string;
  form: { setFieldValue: any };
  field?: any;
  helperText: string;
}

export const ColorPicker = ({ ...props }: ColorPickerProps) => {
  const [displayPicker, setDisplayPicker] = useState(false);
  const [colorHex, setColorHex] = useState('');
  const { t } = useTranslation();

  const { colorCode, name, helperText } = props;

  useEffect(() => {
    setColorHex(colorCode);
  }, [colorCode]);

  const handleChangeComplete = (color: any) => {
    setColorHex(color.hex);
    props.form.setFieldValue(props.field.name, color.hex);
  };

  const onClickAway = () => {
    setDisplayPicker(false);
  };

  return (
    <div className={styles.Container}>
      <div className={styles.ColorPicker} data-testid="ColorPicker">
        <div className={styles.ColorInput}>
          <Input type="text" placeholder={t('Select color')} name={name} value={colorHex} />
        </div>
        <ClickAwayListener onClickAway={onClickAway}>
          <div className={styles.ContainListener}>
            <div
              role="button"
              tabIndex={0}
              data-testid="ChooseColor"
              className={styles.ChooseColor}
              style={{
                backgroundColor: colorHex,
              }}
              onClick={() => setDisplayPicker(!displayPicker)}
              onKeyDown={() => setDisplayPicker(!displayPicker)}
            >
              &nbsp;
            </div>
            {helperText ? (
              <FormHelperText className={styles.HelperText}>{helperText}</FormHelperText>
            ) : null}
            {displayPicker ? (
              <TwitterPicker
                className={styles.PickerPanel}
                triangle="hide"
                onChangeComplete={handleChangeComplete}
              />
            ) : null}
          </div>
        </ClickAwayListener>
      </div>
    </div>
  );
};
