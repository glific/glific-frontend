import { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { t } from 'i18next';
import { Field } from 'formik';

import Upload from '@mui/icons-material/Upload';

import { validateMedia } from 'common/utils';
import { setNotification } from 'common/notification';
import { UPLOAD_MEDIA } from 'graphql/mutations/Chat';
import { getOrganizationServices } from 'services/AuthService';
import { Input } from 'components/UI/Form/Input/Input';
import { Button } from 'components/UI/Form/Button/Button';
import { TileSelector, TileOption } from 'components/UI/Form/TileSelector/TileSelector';
import { attachmentTileMeta, attachmentTypeOptions } from 'containers/HSM/HSMV2/HSMV2.helper';

import styles from './AttachmentField.module.css';

export interface AttachmentFieldChange {
  type: TileOption | null;
  attachmentURL: string;
  validatingURL: boolean;
}

export interface AttachmentFieldProps {
  disabled?: boolean;
  onChange?: (next: AttachmentFieldChange) => void;
  field?: { name: string; value: TileOption | null };
  form?: { touched: any; errors: any; values: any; setFieldValue: (field: string, value: any) => void };
}

export const AttachmentField = ({ disabled = false, onChange, field, form }: AttachmentFieldProps) => {
  const type = field?.value ?? null;
  const attachmentURL = form?.values?.attachmentURL ?? '';
  const meta = type?.id ? attachmentTileMeta[type.id] : undefined;

  const [method, setMethod] = useState<'url' | 'upload'>('url');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isUrlValid, setIsUrlValid] = useState<any>();
  const [validatingURL, setValidatingURL] = useState(false);
  const [uploadMedia] = useMutation(UPLOAD_MEDIA);

  const showUploadButton = method === 'upload';

  useEffect(() => {
    onChange?.({ type, attachmentURL, validatingURL });
  }, [type, attachmentURL, validatingURL]);

  const resetUploadState = () => {
    setUploadingFile(false);
    setUploadedFile(null);
  };

  const setTypeValue = (value: TileOption | null) => form?.setFieldValue('type', value);
  const setAttachmentURLValue = (value: string) => form?.setFieldValue('attachmentURL', value);

  const validateURL = (value: string) => {
    if (!value || !type) {
      return;
    }
    setValidatingURL(true);
    validateMedia(value, String(type.id), false).then((response: any) => {
      setIsUrlValid(response.data.is_valid ? '' : response.data.message);
      setValidatingURL(false);
    });
  };

  useEffect(() => {
    if (!disabled && type && attachmentURL) {
      validateURL(attachmentURL);
    }
  }, [type, attachmentURL]);

  const handleTypeChange = (option: TileOption) => {
    setTypeValue(option);
    setMethod('url');
    resetUploadState();
  };

  const handleClearType = () => {
    setIsUrlValid(undefined);
    setTypeValue(null);
    setAttachmentURLValue('');
    setMethod('url');
    resetUploadState();
  };

  const handleSelectUploadMethod = () => {
    if (!getOrganizationServices('googleCloudStorage')) {
      setNotification(
        t(
          'File upload is not available for your organization. Please use "Provide URL" instead, or ask your admin to enable Google Cloud Storage.'
        ),
        'warning'
      );
      return;
    }
    setMethod('upload');
  };

  const handleSelectUrlMethod = () => {
    setMethod('url');
    resetUploadState();
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    const mediaName = file.name;
    const extension = mediaName.slice((Math.max(0, mediaName.lastIndexOf('.')) || Infinity) + 1);

    setUploadedFile(file);
    setUploadingFile(true);

    const fileType = file.type.split('/')[0].toUpperCase();
    if (['IMAGE', 'VIDEO'].includes(fileType)) {
      setTypeValue({ id: fileType, label: fileType });
    } else if (file.type === 'application/pdf') {
      setTypeValue({ id: 'DOCUMENT', label: 'DOCUMENT' });
    }

    try {
      const result = await uploadMedia({ variables: { media: file, extension } });
      setAttachmentURLValue(result.data.uploadMedia);
      setNotification('File uploaded successfully');
      setUploadingFile(false);
    } catch (error) {
      console.error('Upload error:', error);
      setNotification('File upload failed. Please try again.', 'error');
      resetUploadState();
    }
  };

  const urlField = {
    component: Input,
    name: 'attachmentURL',
    type: 'text',
    validate: () => isUrlValid,
    disabled: disabled || uploadingFile,
    helperText: uploadedFile ? `File uploaded: ${uploadedFile.name}` : undefined,
    inputProp: {
      onBlur: (event: any) => setAttachmentURLValue(event.target.value.trim()),
    },
  };

  const methodToggleRow = type && (
    <>
      <p className={styles.FieldLabel}>{t('How would you like to provide the attachment?')}</p>
      <div className={styles.MethodToggleRow}>
        <Button
          disabled={disabled}
          className={`${styles.MethodToggle} ${method === 'url' ? styles.MethodToggleSelected : ''}`}
          onClick={handleSelectUrlMethod}
        >
          {t('Provide URL')}
        </Button>
        <Button
          disabled={disabled}
          className={`${styles.MethodToggle} ${method === 'upload' ? styles.MethodToggleSelected : ''}`}
          onClick={handleSelectUploadMethod}
        >
          {t('Upload File')}
        </Button>
      </div>
    </>
  );

  return (
    <>
      <TileSelector
        options={attachmentTypeOptions}
        onChange={handleTypeChange}
        onClear={handleClearType}
        clearLabel={t('Clear attachment selection')}
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
              <Button className={styles.ClearSelectionLink} onClick={resetUploadState}>
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
                        handleFileSelect(file);
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
