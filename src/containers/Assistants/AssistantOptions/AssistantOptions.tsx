import {
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Slider,
  Switch,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import styles from './AssistantOptions.module.css';
import HelpIcon from 'components/UI/HelpIcon/HelpIcon';
import AddIcon from 'assets/images/AddGreenIcon.svg?react';
import UploadIcon from 'assets/images/icons/UploadIcon.svg?react';
import DatabaseIcon from 'assets/images/database.svg?react';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import { useMutation, useQuery } from '@apollo/client';
import {
  ADD_FILES_TO_FILE_SEARCH,
  REMOVE_FILES_FROM_ASSISTANT,
  UPLOAD_FILE_TO_OPENAI,
} from 'graphql/mutations/Assistant';
import { GET_ASSISTANT_FILES } from 'graphql/queries/Assistant';
import { setNotification } from 'common/notification';
interface AssistantOptionsProps {
  options: any;
  fileSearch: boolean;
  currentId: any;
  setOptions: any;
}

const temperatureInfo =
  'Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.';

const fileSearchInfo =
  'File search enables the assistant with knowledge from files that you or your users upload. Once a file is uploaded, the assistant automatically decides when to retrieve content based on user requests.';

export const AssistantOptions = ({ currentId, options, setOptions }: AssistantOptionsProps) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [files, setFiles] = useState<any[]>([]);

  const [uploadFile, { loading: uploadingFile }] = useMutation(UPLOAD_FILE_TO_OPENAI);
  const [addFilesToFileSearch, { loading: addingFiles }] = useMutation(ADD_FILES_TO_FILE_SEARCH);
  const [removeFile] = useMutation(REMOVE_FILES_FROM_ASSISTANT);

  const { refetch, data } = useQuery(GET_ASSISTANT_FILES, {
    variables: { assistantId: currentId },
    onCompleted: ({ assistant }) => {
      const attachedFiles = assistant.assistant.vectorStore.files;
      setFiles([...files, ...attachedFiles.map((item: any) => ({ ...item, attached: true }))]);
    },
  });

  const handleFileChange = (event: any) => {
    if (event.target.files.length === 0) return;

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
        onCompleted: (data) => {
          setNotification('Files added to assistant!', 'success');
          setShowUploadDialog(false);
          refetch();
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
        title={`Add files to file search`}
        handleCancel={() => setShowUploadDialog(false)}
        buttonOk="Add"
        fullWidth
        handleOk={handleFileUpload}
        disableOk={addingFiles}
        buttonOkLoading={addingFiles}
      >
        <div className={styles.DialogContent}>
          <Button
            className="Container"
            fullWidth={true}
            component="label"
            variant="text"
            tabIndex={-1}
          >
            <div className={styles.UploadContainer}>
              {uploadingFile ? (
                <CircularProgress size={20} />
              ) : (
                <>
                  <UploadIcon /> Upload File
                </>
              )}
              <input
                data-testid="uploadFile"
                type="file"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </Button>
          {files.length > 0 && (
            <div className={styles.FileList}>
              {files.map((file, index) => (
                <div data-testid="fileItem" className={styles.File} key={index}>
                  <span>{file.filename}</span>
                  <IconButton data-testid="deleteFile" onClick={() => handleRemoveFile(file)}>
                    <DeleteIcon />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
          <span>
            Information in the attached files will be available to this assistant.
            <a href="#">Learn More</a>
          </span>
        </div>
      </DialogBox>
    );
  }

  return (
    <div className={styles.AssistantOptions}>
      <div className={styles.Files}>
        <Typography variant="subtitle2" className={styles.Label} data-testid="inputLabel">
          Tools
        </Typography>
        <div className={styles.FilesHeader}>
          <FormControlLabel
            control={
              <Switch
                checked={options.fileSearch}
                name="fileSearch"
                onChange={(event) => {
                  setOptions({
                    ...options,
                    fileSearch: event.target.checked,
                  });
                }}
              />
            }
            label={
              <div className={styles.LabelContainer}>
                <span>File Search</span>
                <HelpIcon
                  helpData={{
                    heading: fileSearchInfo,
                  }}
                />
              </div>
            }
          />

          <Button
            data-testid="addFiles"
            onClick={() => setShowUploadDialog(true)}
            variant="outlined"
          >
            <AddIcon />
            Add Files
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
            <IconButton data-testid="deleteFile" onClick={() => {}}>
              <DeleteIcon />
            </IconButton>
          </div>
        )}
      </div>

      <div className={styles.Temperature}>
        <Typography variant="subtitle2" className={styles.Label} data-testid="inputLabel">
          Temperature
          <HelpIcon
            helpData={{
              heading: temperatureInfo,
            }}
          />
        </Typography>

        <div className={styles.Slider}>
          <Slider
            onChange={(_, value) => {
              setOptions({
                ...options,
                temperature: value,
              });
            }}
            value={options.temperature}
            step={0.01}
            max={2}
          />
          <input
            value={options.temperature}
            onChange={(event) => {
              setOptions({
                ...options,
                temperature: event.target.value,
              });
            }}
            className={styles.SliderDisplay}
          />
        </div>
      </div>

      {dialog}
    </div>
  );
};
