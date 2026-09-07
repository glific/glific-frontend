import { useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import { Button, CircularProgress, FormHelperText, IconButton, OutlinedInput } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { UPLOAD_MEDIA } from 'graphql/mutations/Chat';
import CrossIcon from 'assets/images/icons/Cross.svg?react';
import styles from './FileUpload.module.css';

export interface FileUploadProps {
  field: { name: string; value: any; onChange?: any; onBlur?: any };
  form?: { setFieldValue: any; touched: any; errors: any };
  disabled?: boolean;
  helperText?: string;
  /** Rejected before upload, so an oversized file never leaves the browser. */
  maxSizeKb?: number;
  /** Passed to the file picker and re-checked on the chosen file. */
  accept?: string;
  /** Show the stored URL as an image rather than as text. */
  preview?: boolean;
  /** Placeholder for the URL field. */
  placeholder?: string;
  /** Store the object under this prefix rather than the default attachment path. */
  folder?: string;
}

const DEFAULT_MAX_SIZE_KB = 200;

/**
 * Match a file against an `accept` list the way the native input does.
 *
 * `accept` takes three forms — an exact MIME type (`image/png`), a wildcard (`image/*`) and a
 * filename extension (`.csv`) — and an empty list means no restriction. Comparing `file.type`
 * against the raw tokens rejects legitimate files for the last two, and rejects everything when
 * `accept` is empty.
 */
const isAccepted = (file: File, accept: string): boolean => {
  const tokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

  if (!tokens.length) return true;

  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  return tokens.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token);
    if (token.endsWith('/*')) return type.startsWith(`${token.slice(0, -1)}`);
    return type === token;
  });
};

export const FileUpload = ({
  field,
  form,
  disabled = false,
  helperText,
  maxSizeKb = DEFAULT_MAX_SIZE_KB,
  accept = 'image/png,image/jpeg,image/webp,image/svg+xml',
  preview = true,
  placeholder = 'https://…',
  folder,
}: FileUploadProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadMedia] = useMutation(UPLOAD_MEDIA);

  const setValue = (value: string) => form?.setFieldValue(field.name, value);

  const onFileChosen = async (event: any) => {
    const file = event.target.files?.[0];
    // Reset immediately so choosing the same file twice after an error still fires onChange.
    event.target.value = '';
    if (!file) return;

    setError(null);

    if (!isAccepted(file, accept)) {
      setError(t('That file type is not supported.'));
      return;
    }

    if (file.size > maxSizeKb * 1024) {
      setError(
        t('That file is {{size}}KB. Please upload something under {{max}}KB.', {
          size: Math.round(file.size / 1024),
          max: maxSizeKb,
        })
      );
      return;
    }

    const extension = file.name.slice((Math.max(0, file.name.lastIndexOf('.')) || Infinity) + 1);
    setUploading(true);

    try {
      // Sent as well as checked above: the client check is for fast feedback, the server
      // check is what actually holds if a request does not come from this form.
      const { data } = await uploadMedia({ variables: { media: file, extension, maxSizeKb, folder } });
      if (data?.uploadMedia) {
        setValue(data.uploadMedia);
      } else {
        setError(t('The upload did not return a file. Please try again.'));
      }
    } catch {
      setError(t('An error occurred while uploading the file.'));
    } finally {
      setUploading(false);
    }
  };

  const fieldError = form?.touched?.[field.name] && form?.errors?.[field.name];

  return (
    <div className={styles.FileUpload} data-testid="fileUpload">
      {field.value && preview && (
        <div className={styles.Current}>
          <img src={field.value} alt={t('Uploaded file')} className={styles.Preview} data-testid="filePreview" />
          {!disabled && (
            <IconButton size="small" data-testid="removeFile" onClick={() => setValue('')} aria-label={t('Remove')}>
              <CrossIcon />
            </IconButton>
          )}
        </div>
      )}

      {/* The stored value is a URL either way. Uploading fills this field; an organisation
          without Google Cloud Storage configured can host the file itself and paste the URL,
          so a missing GCS credential never blocks them. */}
      <div className={styles.Row}>
        <OutlinedInput
          fullWidth
          size="small"
          disabled={disabled}
          value={field.value || ''}
          placeholder={placeholder}
          inputProps={{ 'data-testid': 'fileUrlInput', 'aria-label': t('File URL') }}
          onChange={(event) => {
            setError(null);
            setValue(event.target.value);
          }}
        />

        <input ref={inputRef} type="file" accept={accept} hidden data-testid="fileInput" onChange={onFileChosen} />

        <Button
          variant="outlined"
          size="small"
          disabled={disabled || uploading}
          data-testid="uploadButton"
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <CircularProgress size={16} /> : field.value ? t('Replace') : t('Upload')}
        </Button>
      </div>

      <FormHelperText className={error || fieldError ? styles.DangerText : styles.HelperText}>
        {error || fieldError || helperText || t('Up to {{max}}KB.', { max: maxSizeKb })}
      </FormHelperText>
    </div>
  );
};

export default FileUpload;
