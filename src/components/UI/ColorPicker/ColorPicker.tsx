import React, { useState, useEffect } from 'react';
import styles from './ColorPicker.module.css';
import { TwitterPicker } from 'react-color';
import { Input } from '@material-ui/core';
import FormHelperText from '@material-ui/core/FormHelperText/FormHelperText';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

export interface Props {
  colorCode: string;
  name: string;
  form?: any;
  helperText: string;
}

export const ColorPicker: React.SFC<Props> = ({ ...props }) => {
  const [displayPicker, setDisplayPicker] = useState(false);
  const [colorCode, setColorCode] = useState('');

  useEffect(() => {
    setColorCode(props.colorCode);
  }, [props.colorCode]);

  const handleChangeComplete = (color: any) => {
    setColorCode(color.hex);
    props.form.values.colorCode = color.hex;
  };

  const onClickAway = () => {
    setDisplayPicker(false);
  };

  return (
    <div className={styles.Container}>
      <div className={styles.ColorPicker} data-testid="ColorPicker">
        <div className={styles.ColorInput}>
          <Input type="text" placeholder="Select color" name={props.name} value={colorCode}></Input>
        </div>
        <ClickAwayListener onClickAway={onClickAway}>
          <div className={styles.ContainListener}>
            <div
              className={styles.ChooseColor}
              style={{
                backgroundColor: colorCode,
              }}
              onClick={() => setDisplayPicker(!displayPicker)}
            ></div>
            {props.helperText ? (
              <FormHelperText className={styles.HelperText}>{props.helperText}</FormHelperText>
            ) : null}
            {displayPicker ? (
              <TwitterPicker
                className={styles.PickerPanel}
                triangle={'hide'}
                onChangeComplete={handleChangeComplete}
              />
            ) : null}
          </div>
        </ClickAwayListener>
      </div>
    </div>
  );
};
