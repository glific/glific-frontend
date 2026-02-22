import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
} from '@mui/material';
import { ContentItem } from '../../FormBuilder.types';
import { HelpIcon } from 'components/UI/HelpIcon/HelpIcon';
import styles from './ContentTypes.module.css';

interface TextAnswerContentProps {
  item: ContentItem;
  onUpdate: (updates: Partial<ContentItem>) => void;
  isViewOnly?: boolean;
}

export const TextAnswerContent = ({ item, onUpdate, isViewOnly = false }: TextAnswerContentProps) => {
  const { data, name } = item;

  const isShortAnswer = name === 'Short Answer';
  const shortAnswerTypes = ['Text', 'Password', 'Email', 'Number', 'Passcode', 'Phone'];

  const hasError = !data.label || data.label.trim() === '';

  const handleLabelChange = (e: any) => {
    if (e.target.value.length <= 20) {
      onUpdate({ data: { ...data, label: e.target.value } });
    }
  };

  const handleInstructionsChange = (e: any) => {
    if (e.target.value.length <= 80) {
      onUpdate({ data: { ...data, placeholder: e.target.value } });
    }
  };

  const handleInputTypeChange = (event: SelectChangeEvent<string>) => {
    onUpdate({ data: { ...data, inputType: event.target.value } });
  };

  const handleRequiredChange = (checked: boolean) => {
    onUpdate({ data: { ...data, required: checked } });
  };

  return (
    <div data-testid="text-answer-content" className={styles.ContentTypeContainer}>
      <TextField
        fullWidth
        label={
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Label
            <HelpIcon
              helpData={{
                heading: 'This field name shows up as caption in the form and is also used in header name',
              }}
            />
          </span>
        }
        placeholder="Field Name"
        value={data.label || ''}
        onChange={handleLabelChange}
        error={!isViewOnly && hasError}
        slotProps={{
          htmlInput: { maxLength: 20, readOnly: isViewOnly, 'data-testid': 'label-input' },
          input: {
            endAdornment: <span className={styles.CharCount}>{`${(data.label || '').length}/20`}</span>,
          },
        }}
        helperText={!isViewOnly ? hasError && 'Label is required' : undefined}
        size="small"
        sx={{ mb: 2 }}
      />

      {isShortAnswer && (
        <FormControl fullWidth size="small" sx={{ mb: 2 }} disabled={isViewOnly}>
          <InputLabel>Type</InputLabel>
          <Select
            data-testid="short-answer-type"
            value={data.inputType || 'Text'}
            label="Type"
            onChange={handleInputTypeChange}
          >
            {shortAnswerTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <div className={styles.InstructionsSection}>
        <label className={styles.InstructionsLabel}>
          Instructions <span className={styles.OptionalText}>· Optional</span>
        </label>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Add instructions"
          value={data.placeholder || ''}
          onChange={handleInstructionsChange}
          slotProps={{
            htmlInput: { maxLength: 80, readOnly: isViewOnly },
            input: {
              endAdornment: <span className={styles.CharCount}>{`${(data.placeholder || '').length}/80`}</span>,
            },
          }}
          size="small"
          sx={{ mb: 2 }}
        />
      </div>

      <div className={styles.RequiredToggle}>
        <FormControlLabel
          control={
            <Switch
              checked={data.required || false}
              onChange={(e) => handleRequiredChange(e.target.checked)}
              color="primary"
              disabled={isViewOnly}
            />
          }
          label="Required"
          labelPlacement="start"
          sx={{ ml: 0, justifyContent: 'end', width: '100%' }}
        />
      </div>
    </div>
  );
};
