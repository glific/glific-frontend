import { t } from 'i18next';

import { capitalizeFirstLetter } from 'common/utils';
import { Button } from 'components/UI/Form/Button/Button';
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

export interface TileSelectorProps {
  options: TileOption[];
  onChange: (option: TileOption) => void;
  onClear?: () => void;
  clearLabel?: string;
  selected?: boolean;
  disabled?: boolean;
  variant?: TileSelectorVariant;
  field?: { name: string; value: TileOption | null };
  form?: { touched: any; errors: any };
}

export const TileSelector = ({
  options,
  onChange,
  onClear,
  clearLabel,
  selected,
  disabled = false,
  variant = 'pill',
  field,
  form,
}: TileSelectorProps) => {
  const value = field?.value ?? null;
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
              <Button key={option.id} disabled={disabled} className={tileClassName} onClick={() => onChange(option)}>
                {option.icon && <span className={styles.TileIcon}>{option.icon}</span>}
                <span className={styles.TileTitle}>{capitalizeFirstLetter(String(option.id).toLowerCase())}</span>
                {option.format && <span className={styles.TileMeta}>{option.format}</span>}
                {option.maxSizeLabel && <span className={styles.TileMeta}>{option.maxSizeLabel}</span>}
              </Button>
            );
          }

          if (variant === 'radio') {
            return (
              <Button key={option.id} disabled={disabled} className={tileClassName} onClick={() => onChange(option)}>
                <span className={styles.TileRadio} />
                <span className={styles.TileBody}>
                  <span className={styles.TileTitle}>{capitalizeFirstLetter(option.label.toLowerCase())}</span>
                  {option.description && <span className={styles.TileDescription}>{option.description}</span>}
                </span>
              </Button>
            );
          }

          return (
            <Button key={option.id} disabled={disabled} className={tileClassName} onClick={() => onChange(option)}>
              {option.label}
            </Button>
          );
        })}
      </div>

      {onClear && isActiveSelection && !disabled && (
        <Button className={styles.ClearSelectionLink} onClick={onClear}>
          {clearLabel || t('Clear selection')}
        </Button>
      )}

      {showError && <p className={styles.ErrorText}>{form!.errors[field!.name]}</p>}
    </>
  );
};

export default TileSelector;
