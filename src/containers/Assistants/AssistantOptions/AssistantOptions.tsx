import { useMutation } from '@apollo/client';
import { Button, CircularProgress, IconButton, Slider, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
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
  currentId: any;
  formikValues: any;
  setFieldValue: (field: string, value: any) => void;
  formikErrors: any;
  formikTouched: any;
  isLegacyVectorStore: boolean;
  initialFiles: any[];
}

const temperatureInfo =
  'Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.';
const filesInfo =
  'Enables the assistant with knowledge from files that you or your users upload. Once a file is uploaded, the assistant automatically decides when to retrieve content based on user requests.';

export const AssistantOptions = ({
  currentId,
  formikValues,
  setFieldValue,
  formikErrors,
  formikTouched,
  isLegacyVectorStore,
  initialFiles,
}: AssistantOptionsProps) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [files, setFiles] = useState<any[]>(initialFiles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { t } = useTranslation();

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
        setNotification('File size should be less than 20MB', 'error');
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

  const handleFileUpload = () => {
    const filesToUpload = files.filter((item) => !item.attached);
    if (filesToUpload.length > 0) {
      createKnowledgeBase({
        variables: {
          createKnowledgeBaseId: currentId,
          mediaInfo: files.filter((item) => !item.attached),
        },
        onCompleted: ({ createKnowledgeBase: knowledgeBaseData }) => {
          setFieldValue('knowledgeBaseId', knowledgeBaseData.knowledgeBase.id);
          setFieldValue('knowledgeBaseName', knowledgeBaseData.knowledgeBase.name);
          setFiles((prev) => prev.map((file) => ({ ...file, attached: true })));
          let successMessage = 'Knowledge base created successfully!';
          if (currentId) {
            successMessage = 'Knowledge base updated successfully!';
          }

          setNotification(successMessage, 'success');
          setShowUploadDialog(false);
        },
        onError: (error) => {
          setErrorMessage(error);
        },
      });
    } else {
      setShowUploadDialog(false);
    }
  };

  let dialog;
  if (showUploadDialog) {
    dialog = (
      <DialogBox
        open={showUploadDialog}
        title={t('Manage Files')}
        handleCancel={() => setShowUploadDialog(false)}
        buttonOk="Save"
        fullWidth
        handleOk={handleFileUpload}
        disableOk={addingFiles || loading}
        buttonOkLoading={addingFiles || loading}
      >
        <div className={styles.DialogContent}>
          <Button className="Container" fullWidth={true} component="label" variant="text" tabIndex={-1}>
            <div className={styles.UploadContainer}>
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
              />
            </div>
          </Button>
          {files.length > 0 && (
            <div className={styles.FileList}>
              {files.map((file, index) => (
                <div data-testid="fileItem" className={styles.File} key={index}>
                  <div>
                    <FileIcon />
                    <span>{file.filename}</span>
                  </div>
                  <IconButton data-testid="deleteFile" onClick={() => handleRemoveFile(file)}>
                    <CrossIcon />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
          <span>Individual file size limit: 20MB</span>

          <span>
            {t('Information in the attached files will be available to this assistant.')}
            <a
              href="https://platform.openai.com/docs/assistants/tools/file-search#supported-files"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn More
            </a>
          </span>
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
          <Tooltip
            title={
              isLegacyVectorStore
                ? 'This assistant was created before 28/02/2026. Knowledge base files for old assistants are “read-only”. You can still make changes by creating a new assistant, copying the prompt and other settings, and re-uploading the files there.'
                : ''
            }
            arrow
          >
            <span>
              <Button
                data-testid="addFiles"
                onClick={() => setShowUploadDialog(true)}
                variant="outlined"
                disabled={isLegacyVectorStore}
              >
                <AddIcon />
                {t('Manage Files')}
              </Button>
            </span>
          </Tooltip>
        </div>
        {formikValues.knowledgeBaseId && (
          <div className={styles.VectorStore}>
            <div className={styles.VectorContent}>
              <DatabaseIcon />
              <div>
                <p>{formikValues.knowledgeBaseName}</p>
              </div>
            </div>
            {files.length > 0 && (
              <span>
                {files.length} {files.length === 1 ? 'file' : 'files'}
              </span>
            )}
          </div>
        )}
        {formikTouched?.knowledgeBaseId && formikErrors?.knowledgeBaseId && (
          <p className={styles.ErrorText}>{formikErrors.knowledgeBaseId}</p>
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
            />
          </div>
          {error && <p className={styles.ErrorText}>Temperature value should be between 0-2</p>}
        </div>
      </div>

      {dialog}
    </div>
  );
};
