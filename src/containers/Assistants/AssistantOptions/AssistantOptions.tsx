import { useMutation } from '@apollo/client';
import { Button, CircularProgress, IconButton, Slider, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AddIcon from 'assets/images/AddGreenIcon.svg?react';
import DatabaseIcon from 'assets/images/database.svg?react';
import FileIcon from 'assets/images/FileGreen.svg?react';
import CrossIcon from 'assets/images/icons/Cross.svg?react';
import UploadIcon from 'assets/images/icons/UploadIcon.svg?react';

import { setErrorMessage, setNotification } from 'common/notification';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import HelpIcon from 'components/UI/HelpIcon/HelpIcon';

import { CREATE_KNOWLEDGE_BASE, UPLOAD_FILE_TO_KAAPI } from 'graphql/mutations/Assistant';

import styles from './AssistantOptions.module.css';
interface AssistantOptionsProps {
  formikValues: any;
  setFieldValue: (field: string, value: any) => void;
  formikErrors: any;
  formikTouched: any;
  knowledgeBaseId: string | null;
  isLegacyVectorStore: boolean;
  onFilesChange: (hasChanges: boolean) => void;
  vectorStoreId: string;
  validateForm: () => void;
  disabled: boolean;
}

const temperatureInfo =
  'Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.';
const filesInfo =
  'Enables the assistant with knowledge from files that you or your users upload. Once a file is uploaded, the assistant automatically decides when to retrieve content based on user requests.';

export const AssistantOptions = ({
  formikValues,
  setFieldValue,
  formikErrors,
  formikTouched,
  knowledgeBaseId,
  isLegacyVectorStore,
  onFilesChange,
  vectorStoreId,
  validateForm,
  disabled,
}: AssistantOptionsProps) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [files, setFiles] = useState<any[]>(formikValues.initialFiles.map((f: any) => ({ ...f, status: 'attached' })));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { t } = useTranslation();
  let fileUploadDisabled = false;
  if (isLegacyVectorStore || disabled) {
    fileUploadDisabled = true;
  }

  useEffect(() => {
    setFiles(formikValues.initialFiles.map((f: any) => ({ ...f, status: 'attached' })));
  }, [formikValues.initialFiles]);

  const [uploadFileToKaapi] = useMutation(UPLOAD_FILE_TO_KAAPI);
  const [createKnowledgeBase, { loading: addingFiles }] = useMutation(CREATE_KNOWLEDGE_BASE);

  const uploadFile = async (file: any) => {
    let uploadedFile;
    let errorMessage = null;

    await uploadFileToKaapi({
      variables: {
        media: file,
      },
      onCompleted: ({ uploadFilesearchFile }) => {
        uploadedFile = {
          fileId: uploadFilesearchFile?.fileId,
          filename: uploadFilesearchFile?.filename,
          uploadedAt: uploadFilesearchFile?.uploadedAt,
          fileSize: uploadFilesearchFile?.fileSize,
          status: 'new',
        };
      },
      onError: (errors) => {
        errorMessage = errors.message;
      },
    });

    return { uploadedFile, errorMessage };
  };

  const handleFileChange = (event: any) => {
    const inputFiles = event.target.files;
    let errorMessages: any = [];
    let uploadedFiles: any = [];
    setLoading(true);

    if (inputFiles.length === 0) return;

    const validFiles = Array.from(inputFiles).filter((file: any) => {
      if (file.size / (1024 * 1024) > 20) {
        setNotification('File size should be less than 20MB', 'warning');
        return false;
      }
      return true;
    });

    const uploadPromises = validFiles.map(async (file: any) => {
      const { uploadedFile, errorMessage } = await uploadFile(file);

      if (uploadedFile) {
        uploadedFiles.push(uploadedFile);
      }
      if (errorMessage) {
        errorMessages.push(errorMessage);
      }
    });

    Promise.all(uploadPromises)
      .then(() => {
        setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
        if (errorMessages.length > 0) {
          setNotification(errorMessages.join('\n\n'), 'warning');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error uploading files:', error);
        setLoading(false);
      });
  };

  const handleRemoveFile = (file: any) => {
    setFiles(files.filter((fileItem) => fileItem.fileId !== file.fileId));
  };

  const hasFilesChanged =
    files.length !== formikValues.initialFiles.length || files.some((file) => file.status === 'new');

  const handleFileUpload = () => {
    if (!hasFilesChanged) {
      setShowUploadDialog(false);
      return;
    }

    createKnowledgeBase({
      variables: {
        createKnowledgeBaseId: knowledgeBaseId || null,
        mediaInfo: files.map(({ status, ...rest }) => rest),
      },
      onCompleted: ({ createKnowledgeBase: knowledgeBaseData }) => {
        const updatedFiles = files.map(({ status, ...rest }) => rest);
        setFiles(updatedFiles.map((f) => ({ ...f, status: 'attached' })));
        setFieldValue('initialFiles', updatedFiles);
        setFieldValue('knowledgeBaseVersionId', knowledgeBaseData.knowledgeBase.knowledgeBaseVersionId);
        setFieldValue('knowledgeBaseVersionId', knowledgeBaseData.knowledgeBase.knowledgeBaseVersionId);
        setTimeout(() => validateForm(), 0);
        setFieldValue('knowledgeBaseName', knowledgeBaseData.knowledgeBase.name);
        onFilesChange(true);
        setNotification("Knowledge base creation in progress, will notify once it's done", 'success');
        setShowUploadDialog(false);
      },
      onError: (error) => {
        setErrorMessage(error);
      },
    });
  };

  let dialog;
  if (showUploadDialog) {
    dialog = (
      <DialogBox
        open={showUploadDialog}
        title={t('Manage Files')}
        handleCancel={() => {
          setFiles(formikValues.initialFiles.map((f: any) => ({ ...f, status: 'attached' })));
          setShowUploadDialog(false);
        }}
        buttonOk={fileUploadDisabled ? 'Close' : 'Save'}
        skipCancel={fileUploadDisabled}
        fullWidth
        handleOk={handleFileUpload}
        disableOk={addingFiles || loading || files.length === 0}
        buttonOkLoading={addingFiles || loading}
      >
        <div className={styles.DialogContent}>
          {isLegacyVectorStore ? (
            <p data-testid="readOnlyNote" className={styles.ReadOnlyNote}>
              This assistant was created before 10/03/2026. Knowledge base files for old assistants are read-only. You
              can still make changes by creating a new assistant, copying the prompt and other settings, and
              re-uploading the files there.
            </p>
          ) : (
            <Button className="Container" fullWidth component="label" variant="text" tabIndex={-1}>
              <div className={fileUploadDisabled ? styles.DisabledUploadContainer : styles.UploadContainer}>
                {loading ? (
                  <CircularProgress size={20} />
                ) : (
                  <>
                    <UploadIcon /> {t('Upload File')}
                  </>
                )}
                <input
                  data-testid="uploadFile"
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  multiple
                  disabled={fileUploadDisabled}
                />
              </div>
            </Button>
          )}

          {files.length > 0 && (
            <div className={styles.FileList}>
              {files.map((file, index) => (
                <div data-testid="fileItem" className={styles.File} key={index}>
                  <div>
                    <FileIcon />
                    <span>{file.filename}</span>
                  </div>
                  {fileUploadDisabled ? null : (
                    <IconButton data-testid="deleteFile" onClick={() => handleRemoveFile(file)}>
                      <CrossIcon />
                    </IconButton>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className={styles.UploadInfo}>
            <span>Individual file size limit: 20MB</span>
            <span>Allowed file formats: .csv, .doc, .docx, .html, .java, .md, .pdf, .pptx, .txt</span>
            <span>Each file takes approx 15 secs to upload.</span>
          </div>
        </div>
      </DialogBox>
    );
  }
  return (
    <div className={styles.AssistantOptions}>
      <div className={styles.Files}>
        <div className={styles.FilesHeader}>
          <Typography variant="subtitle2" className={styles.Label} data-testid="inputLabel">
            Knowledge Base Files *
            <HelpIcon
              helpData={{
                heading: filesInfo,
              }}
            />
          </Typography>

          <span>
            <Button data-testid="addFiles" onClick={() => setShowUploadDialog(true)} variant="outlined">
              <AddIcon />
              {t('Manage Files')}
            </Button>
          </span>
        </div>
        {formikValues.knowledgeBaseVersionId && (
          <div className={styles.VectorStore}>
            <div className={styles.VectorContent}>
              <DatabaseIcon />
              <div>
                <p>{formikValues.knowledgeBaseName}</p>
                <span>{vectorStoreId}</span>
              </div>
            </div>
            {files.length > 0 && (
              <span>
                {files.length} {files.length === 1 ? 'file' : 'files'}
              </span>
            )}
          </div>
        )}
        {formikTouched?.knowledgeBaseVersionId && formikErrors?.knowledgeBaseVersionId && (
          <p className={styles.ErrorText}>{formikErrors.knowledgeBaseVersionId}</p>
        )}
        {isLegacyVectorStore && (
          <p className={styles.ReadOnlyNote}>
            This assistant was created before 10/03/2026. Knowledge base files for old assistants are read-only. You can
            still make changes by creating a new assistant, copying the prompt and other settings, and re-uploading the
            files there.
          </p>
        )}
      </div>

      <div className={styles.Temperature}>
        <Typography variant="subtitle2" className={styles.Label} data-testid="inputLabel">
          {t('Temperature')}*
          <HelpIcon
            helpData={{
              heading: temperatureInfo,
            }}
          />
        </Typography>
        <div className={styles.SliderContainer}>
          <div className={styles.Slider}>
            <Slider
              name="slider"
              onChange={(_, value) => {
                setFieldValue('temperature', value);
              }}
              value={formikValues.temperature}
              step={0.01}
              max={2}
              min={0}
              disabled={disabled}
            />
            <input
              role="sliderDisplay"
              name="sliderDisplay"
              type="number"
              step={0.1}
              min={0}
              max={2}
              value={formikValues.temperature}
              onChange={(event) => {
                const value = parseFloat(event.target.value);
                if (value < 0 || value > 2) {
                  setError(true);
                  return;
                }
                setError(false);
                setFieldValue('temperature', value);
              }}
              className={`${styles.SliderDisplay} ${error ? styles.Error : ''}`}
              disabled={disabled && !isLegacyVectorStore}
            />
          </div>
          {error && <p className={styles.ErrorText}>Temperature value should be between 0-2</p>}
        </div>
      </div>

      {dialog}
    </div>
  );
};
