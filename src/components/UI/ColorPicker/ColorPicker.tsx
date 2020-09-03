import React, { useState } from 'react';
import styles from './ColorPicker.module.css';
import { TwitterPicker } from 'react-color';
import { Input } from '../Form/Input/Input';
import FormHelperText from '@material-ui/core/FormHelperText/FormHelperText';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

export interface Props {
  handleChange?: any;
  colorCode: string;
  field?: any;
  form?: any;
  helperText: string;
}

export const ColorPicker: React.SFC<Props> = ({ ...props }) => {
  const [displayPicker, setDisplayPicker] = useState(false);
  let colorCode = props.colorCode ? props.colorCode : '#0C976D';
  props.field.value = colorCode;

  const handleChangeComplete = (color: any, event: any) => {
    colorCode = color.hex;
    props.handleChange(colorCode);
  };

  const onClickAway = () => {
    setDisplayPicker(false);
  };

  return (
    <div className={styles.Container}>
      <div className={styles.ColorPicker} data-testid="ColorPicker">
        <div className={styles.ColorInput}>
          <Input
            type="text"
            placeholder="Select color"
            field={props.field}
            form={props.form}
            label=""
            rows={0}
          ></Input>
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
