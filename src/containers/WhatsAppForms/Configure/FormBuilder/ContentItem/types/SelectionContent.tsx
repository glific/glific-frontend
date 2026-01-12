import AddIcon from '@mui/icons-material/Add';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import { Button, FormControlLabel, IconButton, Switch, TextField } from '@mui/material';
import { ContentItem, ContentOption } from '../../FormBuilder.types';
import styles from './ContentTypes.module.css';

interface SelectionContentProps {
  item: ContentItem;
  onUpdate: (updates: Partial<ContentItem>) => void;
}

export const SelectionContent = ({ item, onUpdate }: SelectionContentProps) => {
  const { data, name } = item;
  const options = data.options || [];

  const getLabelLimit = () => {
    if (name === 'Opt In') return 300;
    if (name === 'Dropdown') return 20;
    return 30;
  };

  const getOptionLimit = () => {
    if (name === 'Dropdown') return 30;
    return 10;
  };

  const labelLimit = getLabelLimit();
  const optionLimit = getOptionLimit();

  const hasLabelError = !data.label || data.label.trim() === '';

  const handleLabelChange = (e: any) => {
    if (e.target.value.length <= labelLimit) {
      onUpdate({ data: { ...data, label: e.target.value } });
    }
  };

  const handleOptionChange = (id: string, value: string) => {
    if (value.length <= optionLimit) {
      const updatedOptions = options.map((opt) => (opt.id === id ? { ...opt, value } : opt));
      onUpdate({ data: { ...data, options: updatedOptions } });
    }
  };

  const handleAddOption = () => {
    const newOption: ContentOption = {
      id: Date.now().toString(),
      value: '',
    };
    onUpdate({ data: { ...data, options: [...options, newOption] } });
  };

  const handleDeleteOption = (id: string) => {
    if (options.length > 2) {
      const updatedOptions = options.filter((opt) => opt.id !== id);
      onUpdate({ data: { ...data, options: updatedOptions } });
    }
  };

  const handleRequiredChange = (checked: boolean) => {
    onUpdate({ data: { ...data, required: checked } });
  };

  const handleReadMoreClick = () => {
    // TODO: Implement the logic to add a "Read more" screen
  };

  return (
    <div className={styles.ContentTypeContainer}>
      <TextField
        fullWidth
        label="Label"
        placeholder="Enter label"
        value={data.label || ''}
        onChange={handleLabelChange}
        error={hasLabelError}
        multiline={name === 'Opt In'}
        rows={name === 'Opt In' ? 4 : 1}
        slotProps={{
          htmlInput: { maxLength: labelLimit },
          input: {
            endAdornment: <div className={styles.CharCount}>{`${(data.label || '').length}/${labelLimit}`}</div>,
          },
        }}
        helperText={hasLabelError ? 'Label is required' : ''}
        size="small"
        sx={{ mb: 2 }}
      />

      {name === 'Opt In' ? (
        <div className={styles.ReadMoreSection}>
          <label className={styles.InstructionsLabel}>
            Read more link <span className={styles.OptionalText}>· Optional</span>
          </label>
          <Button variant="outlined" onClick={handleReadMoreClick} sx={{ textTransform: 'none', mb: 2 }}>
            Add "Read more" screen
          </Button>
        </div>
      ) : (
        <div className={styles.OptionsSection}>
          <label className={styles.SectionLabel}>Options</label>
          {options.map((option) => {
            const optionHasError = !option.value || option.value.trim() === '';
            return (
              <div key={option.id} className={styles.OptionRow}>
                <TextField
                  fullWidth
                  placeholder="Enter option value"
                  value={option.value}
                  onChange={(e) => handleOptionChange(option.id, e.target.value)}
                  error={optionHasError}
                  slotProps={{
                    htmlInput: { maxLength: optionLimit },
                    input: {
                      endAdornment: (
                        <div className={styles.CharCount}>
                          {option.value.length}/{optionLimit}
                        </div>
                      ),
                    },
                  }}
                  helperText={optionHasError ? 'Option value is required' : ''}
                  size="small"
                />
                <IconButton
                  size="small"
                  onClick={() => handleDeleteOption(option.id)}
                  disabled={options.length <= 2}
                  aria-label="Delete option"
                >
                  <DeleteOutlined fontSize="small" />
                </IconButton>
              </div>
            );
          })}

          <Button
            variant="text"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddOption}
            sx={{ mt: 1, textTransform: 'none' }}
          >
            Add Options
          </Button>
        </div>
      )}

      <div className={styles.RequiredToggle}>
        <FormControlLabel
          control={
            <Switch
              checked={data.required || false}
              onChange={(e) => handleRequiredChange(e.target.checked)}
              color="primary"
            />
          }
          label="Required"
          labelPlacement="start"
          sx={{ ml: 0, justifyContent: 'space-between', width: '100%' }}
        />
      </div>
    </div>
  );
};
