import { t } from 'i18next';

import styles from './CategorySelector.module.css';

export interface CategoryOption {
  id: string | number;
  label: string;
}

export interface CategorySelectorProps {
  options: CategoryOption[];
  value: CategoryOption | null;
  onChange: (option: CategoryOption) => void;
  descriptions?: { [key: string]: string };
  disabled?: boolean;
  label?: string;
  field?: { name: string };
  form?: { touched: any; errors: any };
}

const titleCase = (value: string) => (value ? value.charAt(0) + value.slice(1).toLowerCase() : value);

export const CategorySelector = ({
  options,
  value,
  onChange,
  descriptions = {},
  disabled = false,
  label = t('Category'),
  field,
  form,
}: CategorySelectorProps) => {
  const showError = Boolean(field && form && form.errors[field.name] && form.touched[field.name]);

  return (
    <>
      <p className={styles.FieldLabel}>{label}</p>
      <div className={styles.TileGrid}>
        {options.map((option) => (
          <button
            type="button"
            key={option.id}
            disabled={disabled}
            className={`${styles.CategoryTile} ${value?.label === option.label ? styles.TileSelected : ''}`}
            onClick={() => onChange(option)}
          >
            <span className={styles.TileRadio} />
            <span className={styles.TileBody}>
              <span className={styles.TileTitle}>{titleCase(option.label)}</span>
              {descriptions[option.label] && (
                <span className={styles.TileDescription}>{descriptions[option.label]}</span>
              )}
            </span>
          </button>
        ))}
      </div>
      {showError && <p className={styles.ErrorText}>{form!.errors[field!.name]}</p>}
    </>
  );
};

export default CategorySelector;
