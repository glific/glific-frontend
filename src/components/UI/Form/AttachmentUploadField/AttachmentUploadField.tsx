import { t } from 'i18next';
import { Field } from 'formik';

import Upload from '@mui/icons-material/Upload';

import {
  attachmentTileMeta,
  AttachmentTypeOption,
} from 'components/UI/Form/AttachmentTypeSelector/AttachmentTypeSelector';

import styles from './AttachmentUploadField.module.css';

export interface AttachmentUploadFieldProps {
  type: AttachmentTypeOption | null;
  showUploadButton: boolean;
  uploadingFile: boolean;
  uploadedFile: File | null;
  attachmentURL: string;
  onFileSelect: (file: File) => void;
  onResetUpload: () => void;
  urlField: any;
}

export const AttachmentUploadField = ({
  type,
  showUploadButton,
  uploadingFile,
  uploadedFile,
  attachmentURL,
  onFileSelect,
  onResetUpload,
  urlField,
}: AttachmentUploadFieldProps) => {
  const meta = type?.id ? attachmentTileMeta[type.id] : undefined;

  if (showUploadButton) {
    return (
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
            <button type="button" className={styles.ClearSelectionLink} onClick={onResetUpload}>
              {t('Change file')}
            </button>
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
    );
  }

  if (!type) {
    return null;
  }

  return (
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
            `File uploaded: ${uploadedFile.name}`
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
  );
};

export default AttachmentUploadField;
