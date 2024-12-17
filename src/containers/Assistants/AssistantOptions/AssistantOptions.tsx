import { useMutation, useQuery } from '@apollo/client';
import { Button, CircularProgress, IconButton, Slider, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AddIcon from 'assets/images/AddGreenIcon.svg?react';
import DatabaseIcon from 'assets/images/database.svg?react';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import FileIcon from 'assets/images/FileGreen.svg?react';
import UploadIcon from 'assets/images/icons/UploadIcon.svg?react';

import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import HelpIcon from 'components/UI/HelpIcon/HelpIcon';
import { setErrorMessage, setNotification } from 'common/notification';

import {
  ADD_FILES_TO_FILE_SEARCH,
  REMOVE_FILES_FROM_ASSISTANT,
  UPLOAD_FILE_TO_OPENAI,
} from 'graphql/mutations/Assistant';

import { GET_ASSISTANT_FILES } from 'graphql/queries/Assistant';

import styles from './AssistantOptions.module.css';
interface AssistantOptionsProps {
  options: any;
  currentId: any;
  setOptions: any;
}

const temperatureInfo =
  'Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.';
const filesInfo =
  'Enables the assistant with knowledge from files that you or your users upload. Once a file is uploaded, the assistant automatically decides when to retrieve content based on user requests.';
export const AssistantOptions = ({ currentId, options, setOptions }: AssistantOptionsProps) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [error, setError] = useState(false);
  const { t } = useTranslation();

  const [uploadFile, { loading: uploadingFile }] = useMutation(UPLOAD_FILE_TO_OPENAI);
  const [addFilesToFileSearch, { loading: addingFiles }] = useMutation(ADD_FILES_TO_FILE_SEARCH);
  const [removeFile] = useMutation(REMOVE_FILES_FROM_ASSISTANT);

  const { refetch, data } = useQuery(GET_ASSISTANT_FILES, {
    variables: { assistantId: currentId },
    onCompleted: ({ assistant }) => {
      if (assistant.assistant.vectorStore) {
        const attachedFiles = assistant.assistant.vectorStore.files;
        setFiles([...files, ...attachedFiles.map((item: any) => ({ ...item, attached: true }))]);
      }
    },
  });

  const handleFileChange = (event: any) => {
    if (event.target.files.length === 0) return;

    if (event.target.files[0]?.size / (1024 * 1024) > 20) {
      setNotification('File size should be less than 20MB', 'error');
      return;
    }

    uploadFile({
      variables: {
        media: event.target.files[0],
      },
      onCompleted: ({ uploadFilesearchFile }) => {
        uploadFilesearchFile = {
          fileId: uploadFilesearchFile?.fileId,
          filename: uploadFilesearchFile?.filename,
        };
        setFiles([...files, uploadFilesearchFile]);
      },
      onError: (errors) => setErrorMessage(errors),
    });
  };

  const handleRemoveFile = (file: any) => {
    if (file.attached) {
      removeFile({
        variables: {
          fileId: file.fileId,
          removeAssistantFileId: currentId,
        },
        onCompleted: () => {
          refetch();
        },
      });
    }
    setFiles(files.filter((fileItem) => fileItem.fileId !== file.fileId));
  };

  const handleFileUpload = () => {
    const filesToUpload = files.filter((item) => !item.attached);
    if (filesToUpload.length > 0) {
      addFilesToFileSearch({
        variables: {
          addAssistantFilesId: currentId,
          mediaInfo: files.filter((item) => !item.attached),
        },
        onCompleted: () => {
          setNotification('Files added to assistant!', 'success');
          setShowUploadDialog(false);
          refetch();
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
        title={t('Add files to file search')}
        handleCancel={() => setShowUploadDialog(false)}
        buttonOk="Add"
        fullWidth
        handleOk={handleFileUpload}
        disableOk={addingFiles}
        buttonOkLoading={addingFiles}
      >
        <div className={styles.DialogContent}>
          <Button className="Container" fullWidth={true} component="label" variant="text" tabIndex={-1}>
            <div className={styles.UploadContainer}>
              {uploadingFile ? (
                <CircularProgress size={20} />
              ) : (
                <>
                  <UploadIcon /> {t('Upload File')}
                </>
              )}
              <input data-testid="uploadFile" type="file" onChange={handleFileChange} style={{ display: 'none' }} />
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
                    <DeleteIcon />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
          <span>Max File Size: 20MB</span>

          <span>
            {t('Information in the attached files will be available to this assistant.')}
            <a href="https://platform.openai.com/docs/assistants/tools/file-search" target="_blank">
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
            Files
            <HelpIcon
              helpData={{
                heading: filesInfo,
              }}
            />
          </Typography>
          <Button data-testid="addFiles" onClick={() => setShowUploadDialog(true)} variant="outlined">
            <AddIcon />
            {t('Add Files')}
          </Button>
        </div>
        {data?.assistant.assistant.vectorStore && (
          <div className={styles.VectorStore}>
            <div className={styles.VectorContent}>
              <DatabaseIcon />
              <div>
                <p>{data?.assistant.assistant.vectorStore?.name}</p>
                <span>{data?.assistant.assistant.vectorStore?.vectorStoreId}</span>
              </div>
            </div>
            {data?.assistant.assistant.vectorStore.files.length > 0 && (
              <span>{data?.assistant.assistant.vectorStore.files.length} files</span>
            )}
          </div>
        )}
      </div>

      <div className={styles.Temperature}>
        <Typography variant="subtitle2" className={styles.Label} data-testid="inputLabel">
          {t('Temperature')}
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
                setOptions({
                  ...options,
                  temperature: value,
                });
              }}
              value={options.temperature}
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
              value={options.temperature}
              onChange={(event) => {
                const value = parseFloat(event.target.value);
                if (value < 0 || value > 2) {
                  setError(true);
                  return;
                }
                setError(false);
                setOptions({
                  ...options,
                  temperature: value,
                });
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
