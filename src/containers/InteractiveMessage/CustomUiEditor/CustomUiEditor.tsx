import { FormControl, FormHelperText, TextField } from '@mui/material';
import { getIn } from 'formik';
import {
  CUSTOM_UI_MAX_BYTES,
  getEnvelopeSize,
  validateCustomUiPayload,
} from 'containers/InteractiveMessage/CustomUi.helper';
import styles from './CustomUiEditor.module.css';

export interface CustomUiEditorProps {
  field: any;
  form: { touched: any; errors: any; setFieldValue: any; values?: any };
  label?: string;
  helperText?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

/**
 * Monospace JSON editor for the Custom UI payload.
 *
 * Save-time validation lives in `validateCustomUiPayload` and is surfaced through the Yup schema;
 * this component additionally shows live problems and the 64 KB budget so authors do not have to
 * hit Save to find out something is wrong.
 */
export const CustomUiEditor = ({
  field,
  form: { touched, errors, setFieldValue, values },
  label,
  helperText,
  disabled = false,
  onChange,
}: CustomUiEditorProps) => {
  const value = field.value || '';
  const formError = getIn(errors, field.name);
  const formTouched = getIn(touched, field.name);
  const hasFormError = !!(formTouched && formError);

  // §7 — the budget is spent by the ASSEMBLED envelope (type/version/fallback included),
  // compactly encoded, not by the pretty-printed editor text.
  const fallback = values?.body ?? '';
  const size = getEnvelopeSize(value, fallback);
  const overLimit = size > CUSTOM_UI_MAX_BYTES;
  const { errors: liveErrors } = validateCustomUiPayload(value, fallback);

  return (
    <div className={styles.Container} data-testid="customUiEditor">
      <FormControl fullWidth error={hasFormError || overLimit}>
        <TextField
          multiline
          minRows={12}
          maxRows={30}
          fullWidth
          disabled={disabled}
          variant="outlined"
          label={label}
          value={value}
          error={hasFormError || overLimit}
          data-testid="customUiPayloadInput"
          slotProps={{ htmlInput: { className: styles.Editor, 'data-testid': 'customUiPayloadTextarea' } }}
          onChange={(event) => {
            setFieldValue(field.name, event.target.value);
            if (onChange) onChange(event.target.value);
          }}
        />

        <div className={styles.MetaRow}>
          {helperText && <FormHelperText className={styles.Helper}>{helperText}</FormHelperText>}
          <FormHelperText
            className={overLimit ? styles.SizeOver : styles.Size}
            data-testid="customUiPayloadSize"
            error={overLimit}
          >
            {(size / 1024).toFixed(1)} KB of 64 KB
          </FormHelperText>
        </div>

        {liveErrors.length > 0 && (
          <ul className={styles.ErrorList} data-testid="customUiPayloadErrors">
            {liveErrors.map((error) => (
              <li key={`${error.path}-${error.message}`}>{error.message}</li>
            ))}
          </ul>
        )}

        {hasFormError && liveErrors.length === 0 && (
          <FormHelperText error data-testid="customUiPayloadError">
            {formError}
          </FormHelperText>
        )}
      </FormControl>
    </div>
  );
};

export default CustomUiEditor;
