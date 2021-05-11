import React from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

export interface RadioInputProps {
  radioButtons: Array<string>;
  row: boolean;
  handleChange: any;
  groupLabel?: string;
}

export const RadioInput: React.SFC<RadioInputProps> = ({
  radioButtons,
  row = true,
  handleChange,
  groupLabel,
}) => {
  let radioGroupLabel: any;
  if (groupLabel) {
    radioGroupLabel = <FormLabel component="legend">{{ groupLabel }}</FormLabel>;
  }

  let buttons: any;
  if (radioButtons.length) {
    buttons = (
      <RadioGroup row={row} name="radio-buttons" onChange={handleChange}>
        {radioButtons.map((radio: string, index: number) => {
          const key = index;
          return (
            <FormControlLabel
              key={key}
              value={radio}
              control={<Radio color="primary" />}
              label={radio}
            />
          );
        })}
      </RadioGroup>
    );
  }

  return (
    <FormControl component="fieldset">
      {radioGroupLabel}
      {buttons}
    </FormControl>
  );
};
