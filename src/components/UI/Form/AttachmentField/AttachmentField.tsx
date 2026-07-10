import { t } from 'i18next';
import { Field } from 'formik';

import Upload from '@mui/icons-material/Upload';

import { attachmentTileMeta } from 'containers/HSM/HSMV2/HSMV2.helper';
import { TileSelector, TileOption } from 'components/UI/Form/TileSelector/TileSelector';
import { Button } from 'components/UI/Form/Button/Button';

import styles from './AttachmentField.module.css';

export interface AttachmentMethodToggle {
  method: 'url' | 'upload';
  onSelectUrl: () => void;
  onSelectUpload: () => void;
}

export interface AttachmentFieldProps {
  options: TileOption[];
  onChange: (option: TileOption) => void;
  onClear?: () => void;
  clearLabel?: string;
  showUploadButton: boolean;
  uploadingFile: boolean;
  uploadedFile: File | null;
  attachmentURL: string;
  onFileSelect: (file: File) => void;
  onResetUpload: () => void;
  urlField: any;
  methodToggle?: AttachmentMethodToggle;
  disabled?: boolean;
  field?: { name: string; value: TileOption | null };
  form?: { touched: any; errors: any };
}

export const AttachmentField = ({
  options,
  onChange,
  onClear,
  clearLabel,
  showUploadButton,
  uploadingFile,
  uploadedFile,
  attachmentURL,
  onFileSelect,
  onResetUpload,
  urlField,
  methodToggle,
  disabled = false,
  field,
  form,
}: AttachmentFieldProps) => {
  const type = field?.value ?? null;
  const meta = type?.id ? attachmentTileMeta[type.id] : undefined;

  const methodToggleRow = methodToggle && type && (
    <>
      <p className={styles.FieldLabel}>{t('How would you like to provide the attachment?')}</p>
      <div className={styles.MethodToggleRow}>
        <Button
          disabled={disabled}
          className={`${styles.MethodToggle} ${methodToggle.method === 'url' ? styles.MethodToggleSelected : ''}`}
          onClick={methodToggle.onSelectUrl}
        >
          {t('Provide URL')}
        </Button>
        <Button
          disabled={disabled}
          className={`${styles.MethodToggle} ${methodToggle.method === 'upload' ? styles.MethodToggleSelected : ''}`}
          onClick={methodToggle.onSelectUpload}
        >
          {t('Upload File')}
        </Button>
      </div>
    </>
  );

  return (
    <>
      <TileSelector
        options={options}
        onChange={onChange}
        onClear={onClear}
        clearLabel={clearLabel}
        variant="icon"
        disabled={disabled}
        field={field}
        form={form}
      />

      {methodToggleRow}

      {showUploadButton && (
        <div className={styles.FieldGroup}>
          <p className={styles.FieldLabel}>
            {t('Upload File')}
            <span className={styles.Required}>*</span>
          </p>
          {!uploadingFile && uploadedFile && attachmentURL ? (
            <>
              <div className={styles.HelperText}>
                {t('File uploaded:')} {uploadedFile.name}
              </div>
              <Button className={styles.ClearSelectionLink} onClick={onResetUpload}>
                {t('Change file')}
              </Button>
            </>
          ) : (
            <>
              <div className={styles.UploadButtonContainer}>
                <label className={styles.UploadLabel} data-uploading={uploadingFile}>
                  <div className={styles.UploadButton}>
                    {uploadingFile ? (
                      <div className={styles.UploadContent}>
                        <div className={styles.UploadSpinner} />
                        <span className={styles.UploadText}>{t('Uploading...')}</span>
                      </div>
                    ) : (
                      <div className={styles.UploadContent}>
                        {meta?.icon ? (
                          <span className={styles.UploadTypeIcon}>{meta.icon}</span>
                        ) : (
                          <Upload className={styles.UploadIcon} />
                        )}
                        <span className={styles.UploadText}>{t('Click to upload or drag and drop')}</span>
                        {meta && (
                          <span className={styles.UploadHint}>
                            {meta.format.replace(', ', ' or ')} (max {meta.maxSizeMB}MB)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept={meta?.accept || 'image/*,video/*,application/pdf'}
                    onChange={(e: any) => {
                      const file = e.target.files?.[0];
                      if (file && !uploadingFile) {
                        onFileSelect(file);
                      }
                    }}
                    className={styles.HiddenFileInput}
                    disabled={uploadingFile}
                  />
                </label>
              </div>
              <div className={styles.HelperText}>
                {t('Upload a sample file for approval. You can send different content when using the template.')}
              </div>
            </>
          )}
        </div>
      )}

      {!showUploadButton && type && (
        <div className={styles.FieldGroup}>
          <p className={styles.FieldLabel}>
            {t('Attachment URL')}
            <span className={styles.Required}>*</span>
          </p>
          <Field
            {...urlField}
            placeholder={t('https://example.com/image.jpg')}
            helperText={
              uploadedFile ? (
                `${t('File uploaded:')} ${uploadedFile.name}`
              ) : (
                <>
                  {t(
                    'Provide a sample attachment URL for approval. You can send different content when using the template.'
                  )}{' '}
                  <strong>
                    {t('Max file size:')} {meta?.maxSizeMB ?? 16} MB
                  </strong>
                </>
              )
            }
          />
        </div>
      )}
    </>
  );
};

export default AttachmentField;
