import { useMutation, useQuery } from '@apollo/client';
import { CircularProgress, IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import { useState } from 'react';

import AddIcon from 'assets/images/AddGreenIcon.svg?react';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import FileIcon from 'assets/images/FileGreen.svg?react';
import UploadIcon from 'assets/images/icons/UploadIcon.svg?react';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { REMOVE_FILES_FROM_STORAGE, UPLOAD_FILES_TO_STORAGE } from 'graphql/mutations/Storage';
import { VECTOR_STORE_FILES } from 'graphql/queries/Storage';

import styles from './Files.module.css';

interface FilesProps {
  vectorStoreId: string;
}

export const FilesAttached = ({ vectorStoreId }: FilesProps) => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [files, setFiles] = useState<any[]>([]);

  const {
    data,
    refetch,
    loading: filesLoading,
  } = useQuery(VECTOR_STORE_FILES, {
    variables: {
      vectorStoreId: vectorStoreId,
    },
  });

  const [uploadFiles, { loading }] = useMutation(UPLOAD_FILES_TO_STORAGE);
  const [removeFile] = useMutation(REMOVE_FILES_FROM_STORAGE);

  const handleFileUpload = () => {
    uploadFiles({
      variables: { media: files.map((file) => file.file), addVectorStoreFilesId: vectorStoreId },
      onCompleted: () => {
        setFiles([]);
        setShowUploadDialog(false);
        refetch();
      },
    });
  };

  const handleDeleteFile = (fileId: any) => {
    removeFile({
      variables: {
        fileId,
        removeVectorStoreFileId: vectorStoreId,
      },
      onCompleted: () => {
        refetch();
      },
    });
  };

  const handleFileChange = (event: any) => {
    if (event.target.files.length === 0) return;
    setFiles([
      ...files,
      {
        file: event.target.files[0],
        id: `${event.target.files[0].name}${Date.now()}`,
      },
    ]);
  };

  const handleRemoveFile = (id: any) => {
    setFiles(files.filter((file) => file.id !== id));
  };

  let dialog;
  if (showUploadDialog) {
    dialog = (
      <DialogBox
        open={showUploadDialog}
        title={`Upload files for ${data?.vectorStore?.vectorStore?.name}`}
        handleCancel={() => setShowUploadDialog(false)}
        buttonOk="Upload"
        fullWidth
        handleOk={handleFileUpload}
        disableOk={loading}
        buttonOkLoading={loading}
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
              <UploadIcon />
              Upload File
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
                  <span>{file.file.name}</span>
                  <IconButton data-testid="deleteFile" onClick={() => handleRemoveFile(file.id)}>
                    <DeleteIcon />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
          <span>
            Information in attached files will be available to Vector store for vyse module.{' '}
            <a href="#">Learn More</a>
          </span>
        </div>
      </DialogBox>
    );
  }

  return (
    <div className={styles.Container}>
      <div className={styles.Header}>
        <h5>Files Attached</h5>
        <Button data-testid="addFiles" onClick={() => setShowUploadDialog(true)} variant="outlined">
          <AddIcon />
          Add Files
        </Button>
      </div>
      <div className={styles.FileList}>
        {filesLoading ? (
          <CircularProgress />
        ) : (
          data?.vectorStore?.vectorStore?.files &&
          (data?.vectorStore?.vectorStore?.files.length === 0 ? (
            <div className={styles.EmptyText}>This vector store is empty.</div>
          ) : (
            data?.vectorStore?.vectorStore?.files?.map((file: any) => (
              <div data-testid="vectorFile" className={styles.File} key={file.id}>
                <div>
                  <FileIcon />
                  <span>{file.name}</span>
                </div>
                <IconButton
                  data-testid="removeVectorFile"
                  onClick={() => handleDeleteFile(file.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            ))
          ))
        )}
      </div>
      {dialog}
    </div>
  );
};
