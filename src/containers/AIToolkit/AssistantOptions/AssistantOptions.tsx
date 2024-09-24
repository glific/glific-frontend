import { FormControlLabel, Slider, Switch, Typography } from '@mui/material';
import { useState } from 'react';
import styles from './AssistantOptions.module.css';
import InfoIcon from 'assets/images/icons/Info.svg?react';
import Tooltip from 'components/UI/Tooltip/Tooltip';
import HelpIcon from 'components/UI/HelpIcon/HelpIcon';

interface AssistantOptionsProps {
  form: any;
  field: any;
  fileSearch: boolean;
}

const temperatureInfo =
  'Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.';

const fileSearchInfo =
  'File search enables the assistant with knowledge from files that you or your users upload. Once a file is uploaded, the assistant automatically decides when to retrieve content based on user requests.';

export const AssistantOptions = ({ form, field, fileSearch }: AssistantOptionsProps) => {
  const [checked, setChecked] = useState(false);
  console.log(field.value);

  return (
    <div className={styles.AssistantOptions}>
      <div>
        <Typography variant="subtitle2" className={styles.Label} data-testid="inputLabel">
          Tools
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={field.value.fileSearch}
              name="fileSearch"
              onChange={(event) => {
                form.setFieldValue('options', {
                  ...field.value,
                  fileSearch: event.target.checked,
                });
                console.log(event.target.checked);
              }}
            />
          }
          label="File Search"
        />

        <button>Files</button>
      </div>

      <div className={styles.Temperature}>
        <Typography variant="subtitle2" className={styles.Label} data-testid="inputLabel">
          Temperature
          <HelpIcon
            helpData={{
              heading: temperatureInfo,
            }}
          />
        </Typography>

        <div className={styles.Slider}>
          <Slider
            onChange={(_, value) => {
              form.setFieldValue('options', {
                ...field.value,
                temperature: value,
              });
            }}
            value={field.value.temperature}
            step={0.01}
            max={2}
          />
          <input
            value={field.value.temperature}
            onChange={(event) => {
              form.setFieldValue('options', {
                ...field.value,
                temperature: event.target.value,
              });
            }}
            className={styles.SliderDisplay}
          />
        </div>
      </div>
    </div>
  );
};
