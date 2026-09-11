import { FormHelperText, OutlinedInput } from '@mui/material';
import { useTranslation } from 'react-i18next';

import styles from './ColorInput.module.css';

export interface ColorInputProps {
  field: { name: string; value: any; onChange?: any; onBlur?: any };
  form?: { setFieldValue: any; touched: any; errors: any };
  disabled?: boolean;
  helperText?: string;
  /** Shown when the field is empty, and what the swatch falls back to. */
  fallback?: string;
}

const HEX = /^#[0-9a-f]{6}$/i;
const SHORT_HEX = /^#[0-9a-f]{3}$/i;

/**
 * Expand `#abc`, add a missing `#`, and upper-case — so a value pasted from a brand guide in
 * any of its usual spellings lands as one the colour picker and the server both accept.
 */
export const normalizeHex = (value: string): string => {
  const trimmed = value.trim().toUpperCase();
  const hashed = trimmed.startsWith('#') || trimmed === '' ? trimmed : `#${trimmed}`;

  if (!SHORT_HEX.test(hashed)) return hashed;

  const [, r, g, b] = hashed;
  return `#${r}${r}${g}${g}${b}${b}`;
};

export const ColorInput = ({ field, form, disabled = false, helperText, fallback = '#000000' }: ColorInputProps) => {
  const { t } = useTranslation();
  const value = field.value || '';
  const error = form?.touched?.[field.name] && form?.errors?.[field.name];

  const setValue = (next: string) => form?.setFieldValue(field.name, next);

  return (
    <div className={styles.ColorInput} data-testid={`colorInput-${field.name}`}>
      <div className={`${styles.Row} ${error ? styles.RowError : ''}`}>
        {/* The native picker only accepts #rrggbb, so a half-typed value would reset it to
            black and silently overwrite what the admin is in the middle of typing. */}
        <input
          type="color"
          className={styles.Swatch}
          disabled={disabled}
          aria-label={t('Pick a colour')}
          data-testid={`colorSwatch-${field.name}`}
          value={HEX.test(value) ? value : fallback}
          onChange={(event) => setValue(event.target.value.toUpperCase())}
        />
        <OutlinedInput
          fullWidth
          size="small"
          disabled={disabled}
          value={value}
          placeholder={fallback.toUpperCase()}
          className={styles.Hex}
          inputProps={{ name: field.name, 'data-testid': `colorHex-${field.name}`, 'aria-label': field.name }}
          onChange={(event) => setValue(event.target.value)}
          onBlur={(event) => {
            setValue(normalizeHex(event.target.value));
            field.onBlur?.(event);
          }}
        />
      </div>

      {(error || helperText) && (
        <FormHelperText className={error ? styles.DangerText : styles.HelperText}>{error || helperText}</FormHelperText>
      )}
    </div>
  );
};

export default ColorInput;
