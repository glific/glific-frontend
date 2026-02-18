import AddIcon from '@mui/icons-material/Add';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import { Button, FormControlLabel, IconButton, Switch, TextField } from '@mui/material';
import { ContentItem, ContentOption } from '../../FormBuilder.types';
import { HelpIcon } from 'components/UI/HelpIcon/HelpIcon';
import styles from './ContentTypes.module.css';

interface SelectionContentProps {
  item: ContentItem;
  onUpdate: (updates: Partial<ContentItem>) => void;
  isViewOnly?: boolean;
}

export const SelectionContent = ({ item, onUpdate, isViewOnly = false }: SelectionContentProps) => {
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
    const existingIds = new Set(options.map((opt) => opt.id));
    let counter = options.length + 1;
    while (existingIds.has(`Option_${counter}`)) {
      counter++;
    }
    const newOption: ContentOption = {
      id: `Option_${counter}`,
      value: `Option ${counter}`,
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

  return (
    <div className={styles.ContentTypeContainer}>
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
        placeholder="Enter label"
        value={data.label || ''}
        onChange={handleLabelChange}
        error={!isViewOnly && hasLabelError}
        multiline={name === 'Opt In'}
        rows={name === 'Opt In' ? 4 : 1}
        slotProps={{
          htmlInput: { maxLength: labelLimit, readOnly: isViewOnly, 'data-testid': 'label-input' },
          input: {
            endAdornment: !isViewOnly ? (
              <div className={styles.CharCount}>{`${(data.label || '').length}/${labelLimit}`}</div>
            ) : undefined,
          },
        }}
        helperText={!isViewOnly && hasLabelError ? 'Label is required' : ''}
        size="small"
        sx={{ mb: 2 }}
      />

      {name !== 'Opt In' && (
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
                  error={!isViewOnly && optionHasError}
                  slotProps={{
                    htmlInput: { maxLength: optionLimit, readOnly: isViewOnly, 'data-testid': 'option-input' },
                    input: {
                      endAdornment: !isViewOnly ? (
                        <div className={styles.CharCount}>
                          {option.value.length}/{optionLimit}
                        </div>
                      ) : undefined,
                    },
                  }}
                  helperText={!isViewOnly && optionHasError ? 'Option value is required' : ''}
                  size="small"
                />
                {!isViewOnly && (
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteOption(option.id)}
                    disabled={options.length <= 2}
                    aria-label="Delete option"
                    data-testid="delete-option-button"
                  >
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                )}
              </div>
            );
          })}

          {!isViewOnly && (
            <Button
              variant="text"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddOption}
              sx={{ mt: 1, textTransform: 'none' }}
              data-testid="add-option-button"
            >
              Add Options
            </Button>
          )}
        </div>
      )}

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
