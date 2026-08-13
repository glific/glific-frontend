import { FormControl, FormHelperText, TextField } from '@mui/material';
import { getIn } from 'formik';
import {
  BLOCKS_MAX_UNWRAPPED_BYTES,
  buildBlocksEnvelope,
  getUnwrappedSize,
  validateBlocksPayload,
} from 'containers/InteractiveMessage/Blocks.helper';
import styles from './BlocksEditor.module.css';

export interface BlocksEditorProps {
  field: any;
  form: { touched: any; errors: any; setFieldValue: any; values?: any };
  label?: string;
  helperText?: string;
  disabled?: boolean;
  /** The component fixed by the type selector; null for a Custom Block (author-supplied). */
  componentName?: string | null;
  onChange?: (value: string) => void;
}

/**
 * Monospace JSON editor for the typed Blocks payload.
 *
 * Save-time validation lives in `validateBlocksPayload` and is surfaced through the Yup schema;
 * this component additionally shows live problems and the 64 KB budget so authors do not have to
 * hit Save to find out something is wrong. The budget shown is the OUTBOUND one, measured on the
 * unwrapped envelope (contract §7) — the typed wrapper does not count against the author.
 */
export const BlocksEditor = ({
  field,
  form: { touched, errors, setFieldValue },
  label,
  helperText,
  disabled = false,
  componentName = null,
  onChange,
}: BlocksEditorProps) => {
  const value = field.value || '';
  const formError = getIn(errors, field.name);
  const formTouched = getIn(touched, field.name);
  const hasFormError = !!(formTouched && formError);

  const size = getUnwrappedSize(buildBlocksEnvelope(value, componentName));
  const overLimit = size > BLOCKS_MAX_UNWRAPPED_BYTES;
  const { errors: liveErrors } = validateBlocksPayload(value, componentName);

  return (
    <div className={styles.Container} data-testid="blocksEditor">
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
          data-testid="blocksPayloadInput"
          slotProps={{ htmlInput: { className: styles.Editor, 'data-testid': 'blocksPayloadTextarea' } }}
          onChange={(event) => {
            setFieldValue(field.name, event.target.value);
            if (onChange) onChange(event.target.value);
          }}
        />

        <div className={styles.MetaRow}>
          {helperText && <FormHelperText className={styles.Helper}>{helperText}</FormHelperText>}
          <FormHelperText
            className={overLimit ? styles.SizeOver : styles.Size}
            data-testid="blocksPayloadSize"
            error={overLimit}
          >
            {(size / 1024).toFixed(1)} KB of 64 KB
          </FormHelperText>
        </div>

        {liveErrors.length > 0 && (
          <ul className={styles.ErrorList} data-testid="blocksPayloadErrors">
            {liveErrors.map((error) => (
              <li key={`${error.path}-${error.message}`}>{error.message}</li>
            ))}
          </ul>
        )}

        {hasFormError && liveErrors.length === 0 && (
          <FormHelperText error data-testid="blocksPayloadError">
            {formError}
          </FormHelperText>
        )}
      </FormControl>
    </div>
  );
};

export default BlocksEditor;
