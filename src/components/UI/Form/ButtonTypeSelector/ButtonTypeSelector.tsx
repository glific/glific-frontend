import { t } from 'i18next';

import styles from './ButtonTypeSelector.module.css';

export interface ButtonTypeOption {
  id: string;
  label: string;
}

export interface ButtonTypeSelectorProps {
  options: ButtonTypeOption[];
  value: ButtonTypeOption | null;
  selected: boolean;
  onChange: (option: ButtonTypeOption) => void;
  onClear: () => void;
  disabled?: boolean;
  label?: string;
}

export const ButtonTypeSelector = ({
  options,
  value,
  selected,
  onChange,
  onClear,
  disabled = false,
  label = t('Button Type'),
}: ButtonTypeSelectorProps) => (
  <>
    <p className={styles.FieldLabel}>{label}</p>
    <div className={styles.TileRow}>
      {options.map((option) => (
        <button
          type="button"
          key={option.id}
          disabled={disabled}
          className={`${styles.Tile} ${selected && value?.id === option.id ? styles.TileSelected : ''}`}
          onClick={() => onChange(option)}
        >
          {option.label}
        </button>
      ))}
    </div>
    {selected && !disabled && (
      <button type="button" className={styles.ClearSelectionLink} onClick={onClear}>
        {t('Clear button selection')}
      </button>
    )}
  </>
);

export default ButtonTypeSelector;
