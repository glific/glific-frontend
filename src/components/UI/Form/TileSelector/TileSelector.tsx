import { t } from 'i18next';

import { capitalizeFirstLetter } from 'common/utils';
import styles from './TileSelector.module.css';

export interface TileOption {
  id: string | number;
  label: string;
}

export type TileSelectorVariant = 'pill' | 'icon' | 'radio';

export interface TileMeta {
  icon?: any;
  format?: string;
  maxSizeLabel?: string;
}

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
  // Whether the current `value` should be shown as active, separate from
  // `value` itself — needed for the "Button Type" usage, whose `value`
  // (templateType) stays set even while the button section is toggled off.
  // Defaults to Boolean(value), which is right for the simpler cases
  // (attachment/category) where value is null until something is picked.
  selected?: boolean;
  disabled?: boolean;
  variant?: TileSelectorVariant;
  // matches options against `value` by this field — category values are
  // sometimes prefilled from an anchor template with only a label and no
  // stable id, so that usage must match on label instead of id.
  matchBy?: 'id' | 'label';
  descriptions?: { [key: string]: string }; // radio variant
  tileMeta?: { [key: string]: TileMeta }; // icon variant
  methodToggle?: TileMethodToggle; // icon variant's "Provide URL / Upload File" toggle, shown once a value is picked
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
  matchBy = 'id',
  descriptions = {},
  tileMeta = {},
  methodToggle,
  field,
  form,
}: TileSelectorProps) => {
  const isActiveSelection = selected ?? Boolean(value);
  const isOptionActive = (option: TileOption) =>
    isActiveSelection && value?.[matchBy] !== undefined && value[matchBy] === option[matchBy];
  const showError = Boolean(field && form && form.errors[field.name] && form.touched[field.name]);

  return (
    <>
      <div className={variant === 'radio' ? styles.TileGrid : styles.TileRow}>
        {options.map((option) => {
          const isSelected = isOptionActive(option);
          const tileClassName = `${styles.Tile} ${styles[variant]} ${isSelected ? styles.TileSelected : ''}`;

          if (variant === 'icon') {
            const meta = tileMeta[option.id];
            return (
              <button
                type="button"
                key={option.id}
                disabled={disabled}
                className={tileClassName}
                onClick={() => onChange(option)}
              >
                {meta?.icon && <span className={styles.TileIcon}>{meta.icon}</span>}
                <span className={styles.TileTitle}>{capitalizeFirstLetter(String(option.id).toLowerCase())}</span>
                {meta?.format && <span className={styles.TileMeta}>{meta.format}</span>}
                {meta?.maxSizeLabel && <span className={styles.TileMeta}>{meta.maxSizeLabel}</span>}
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
                  {descriptions[option.label] && (
                    <span className={styles.TileDescription}>{descriptions[option.label]}</span>
                  )}
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
