import { t } from 'i18next';

import { capitalizeFirstLetter } from 'common/utils';
import styles from './TileSelector.module.css';

export interface TileOption {
  id: string | number;
  label: string;
  description?: string;
  icon?: any;
  format?: string;
  maxSizeLabel?: string;
}

export type TileSelectorVariant = 'pill' | 'icon' | 'radio';

export interface TileMethodToggle {
  method: 'url' | 'upload';
  onSelectUrl: () => void;
  onSelectUpload: () => void;
}

export interface TileSelectorProps {
  options: TileOption[];
  value: TileOption | null;
  onChange: (option: TileOption) => void;
  onClear?: () => void;
  clearLabel?: string;
  selected?: boolean;
  disabled?: boolean;
  variant?: TileSelectorVariant;
  methodToggle?: TileMethodToggle;
  field?: { name: string };
  form?: { touched: any; errors: any };
}

export const TileSelector = ({
  options,
  value,
  onChange,
  onClear,
  clearLabel,
  selected,
  disabled = false,
  variant = 'pill',
  methodToggle,
  field,
  form,
}: TileSelectorProps) => {
  const isActiveSelection = selected ?? Boolean(value);
  const isOptionActive = (option: TileOption) => isActiveSelection && value?.id !== undefined && value.id === option.id;
  const showError = Boolean(field && form && form.errors[field.name] && form.touched[field.name]);

  return (
    <>
      <div className={variant === 'radio' ? styles.TileGrid : styles.TileRow}>
        {options.map((option) => {
          const isSelected = isOptionActive(option);
          const tileClassName = `${styles.Tile} ${styles[variant]} ${isSelected ? styles.TileSelected : ''}`;

          if (variant === 'icon') {
            return (
              <button
                type="button"
                key={option.id}
                disabled={disabled}
                className={tileClassName}
                onClick={() => onChange(option)}
              >
                {option.icon && <span className={styles.TileIcon}>{option.icon}</span>}
                <span className={styles.TileTitle}>{capitalizeFirstLetter(String(option.id).toLowerCase())}</span>
                {option.format && <span className={styles.TileMeta}>{option.format}</span>}
                {option.maxSizeLabel && <span className={styles.TileMeta}>{option.maxSizeLabel}</span>}
              </button>
            );
          }

          if (variant === 'radio') {
            return (
              <button
                type="button"
                key={option.id}
                disabled={disabled}
                className={tileClassName}
                onClick={() => onChange(option)}
              >
                <span className={styles.TileRadio} />
                <span className={styles.TileBody}>
                  <span className={styles.TileTitle}>{capitalizeFirstLetter(option.label.toLowerCase())}</span>
                  {option.description && <span className={styles.TileDescription}>{option.description}</span>}
                </span>
              </button>
            );
          }

          return (
            <button
              type="button"
              key={option.id}
              disabled={disabled}
              className={tileClassName}
              onClick={() => onChange(option)}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {onClear && isActiveSelection && !disabled && (
        <button type="button" className={styles.ClearSelectionLink} onClick={onClear}>
          {clearLabel || t('Clear selection')}
        </button>
      )}

      {showError && <p className={styles.ErrorText}>{form!.errors[field!.name]}</p>}

      {methodToggle && value && (
        <>
          <p className={styles.FieldLabel}>{t('How would you like to provide the attachment?')}</p>
          <div className={styles.MethodToggleRow}>
            <button
              type="button"
              disabled={disabled}
              className={`${styles.MethodToggle} ${methodToggle.method === 'url' ? styles.TileSelected : ''}`}
              onClick={methodToggle.onSelectUrl}
            >
              {t('Provide URL')}
            </button>
            <button
              type="button"
              disabled={disabled}
              className={`${styles.MethodToggle} ${methodToggle.method === 'upload' ? styles.TileSelected : ''}`}
              onClick={methodToggle.onSelectUpload}
            >
              {t('Upload File')}
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default TileSelector;
