import React, { useState } from 'react';
import styles from './ColorPicker.module.css';
import { TwitterPicker } from 'react-color';
import { Input } from '../Form/Input/Input';

export interface Props {
  handleChange?: any;
  colorCode: string;
  field?: any;
  form?: any;
}

export const ColorPicker: React.SFC<Props> = ({ ...props }) => {
  const [displayPicker, setDisplayPicker] = useState(false);
  let colorCode = props.colorCode ? props.colorCode : '#7bdcb5';

  console.log('Props', props);

  const handleChangeComplete = (color: any, event: any) => {
    colorCode = color.hex;
    props.handleChange(colorCode);
  };

  const handleClick = () => {
    setDisplayPicker(!displayPicker);
  };

  return (
    <div className={styles.ColorPicker} data-testid="ColorPicker">
      {/* <Input
        type="text"
        placeholder="Select color"
        field={props.field}
        form={props.form}
        label="st"
        rows={1}
      ></Input> */}
      <div
        className={styles.ChooseColor}
        style={{
          backgroundColor: colorCode,
        }}
        onClick={handleClick}
      ></div>
      {displayPicker ? <TwitterPicker onChangeComplete={handleChangeComplete} /> : null}
    </div>
  );
};
