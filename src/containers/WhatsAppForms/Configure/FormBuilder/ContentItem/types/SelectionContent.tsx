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
  const options = data.options || [
    { id: '1', value: '' },
    { id: '2', value: '' },
  ];

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
    console.log('Add Read more screen');
  };

  return (
    <div className={styles.contentTypeContainer}>
      <TextField
        fullWidth
        label="Label"
        placeholder="Enter label"
        value={data.label || ''}
        onChange={handleLabelChange}
        multiline={name === 'Opt In'}
        rows={name === 'Opt In' ? 4 : 1}
        slotProps={{
          htmlInput: { maxLength: labelLimit },
          input: {
            endAdornment: <div className={styles.charCount}>{`${(data.label || '').length}/${labelLimit}`}</div>,
          },
        }}
        size="small"
        sx={{ mb: 2 }}
      />

      {name === 'Opt In' ? (
        <div className={styles.readMoreSection}>
          <label className={styles.instructionsLabel}>
            Read more link <span className={styles.optionalText}>· Optional</span>
          </label>
          <Button variant="outlined" onClick={handleReadMoreClick} sx={{ textTransform: 'none', mb: 2 }}>
            Add "Read more" screen
          </Button>
        </div>
      ) : (
        <div className={styles.optionsSection}>
          <label className={styles.sectionLabel}>Options</label>
          {options.map((option) => (
            <div key={option.id} className={styles.optionRow}>
              <TextField
                fullWidth
                placeholder="Enter option value"
                value={option.value}
                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                slotProps={{
                  htmlInput: { maxLength: optionLimit },
                  input: {
                    endAdornment: (
                      <div className={styles.charCount}>
                        {option.value.length}/{optionLimit}
                      </div>
                    ),
                  },
                }}
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
          ))}

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

      <div className={styles.requiredToggle}>
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
