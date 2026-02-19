import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { formComponenets } from '../../FormBuilder.helper';
import { ContentItem } from '../../FormBuilder.types';
import styles from './ContentTypes.module.css';

interface TextContentProps {
  item: ContentItem;
  onUpdate: (updates: Partial<ContentItem>) => void;
  isViewOnly?: boolean;
}

export const TextContent = ({ item, onUpdate, isViewOnly = false }: TextContentProps) => {
  const { data, name } = item;

  const textTypes = formComponenets.find((component) => component.name === 'Text')?.children || [];
  const hasError = !data.text || data.text.trim() === '';

  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    onUpdate({ name: event.target.value });
  };

  const handleTextChange = (e: any) => {
    if (e.target.value.length <= 80) {
      onUpdate({ data: { ...data, text: e.target.value } });
    }
  };

  return (
    <div data-testid="text-content" className={styles.ContentTypeContainer}>
      <FormControl fullWidth size="small" sx={{ mb: 2 }} disabled={isViewOnly}>
        <InputLabel>Type</InputLabel>
        <Select value={name || ''} label="Type" onChange={handleTypeChange}>
          {textTypes.map((child) => (
            <MenuItem key={child.name} value={child.name}>
              {child.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Text"
        placeholder="Enter text content"
        value={data.text || ''}
        onChange={handleTextChange}
        error={!isViewOnly && hasError}
        slotProps={{
          htmlInput: {
            maxLength: 80,
            readOnly: isViewOnly,
            'data-testid': 'text-content-input',
          },
          input: {
            endAdornment: <span className={styles.CharCount}>{`${(data.text || '').length}/80`}</span>,
          },
        }}
        helperText={!isViewOnly ? hasError && 'Text is required' : undefined}
        size="small"
      />
    </div>
  );
};
