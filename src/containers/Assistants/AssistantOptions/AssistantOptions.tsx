import { useMutation } from '@apollo/client';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Button, CircularProgress, IconButton, Slider, Tooltip, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
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

type FileStatus = 'attached' | 'queued' | 'uploading' | 'failed';

interface AssistantFile {
  fileId?: string;
  filename: string;
  uploadedAt?: string;
  fileSize?: number;
  status: FileStatus;
  tempId: string;
  errorMessage?: string;
}

interface UploadedFile {
  fileId?: string;
  filename: string;
  uploadedAt?: string;
  fileSize?: number;
}

const MAX_FILES = 500;
const MAX_CONCURRENT_UPLOADS = 10;

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
  const mapInitialFileToAssistantFile = (file: any): AssistantFile => ({
    ...file,
    status: 'attached',
    tempId: file.fileId || file.filename,
  });

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [files, setFiles] = useState<AssistantFile[]>(formikValues.initialFiles.map(mapInitialFileToAssistantFile));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const uploadSessionRef = useRef(0);
  const activeControllersRef = useRef<AbortController[]>([]);
  const isUploadDialogOpenRef = useRef(false);
  const { t } = useTranslation();
  let fileUploadDisabled = false;
  if (isLegacyVectorStore || disabled) {
    fileUploadDisabled = true;
  }

  useEffect(() => {
    setFiles(formikValues.initialFiles.map(mapInitialFileToAssistantFile));
  }, [formikValues.initialFiles]);

  useEffect(() => {
    isUploadDialogOpenRef.current = showUploadDialog;
  }, [showUploadDialog]);

  const [uploadFileToKaapi] = useMutation(UPLOAD_FILE_TO_KAAPI);
  const [createKnowledgeBase, { loading: addingFiles }] = useMutation(CREATE_KNOWLEDGE_BASE);

  const isAbortError = (error: any) => {
    const message = error?.message || error?.networkError?.message;
    return Boolean(
      error?.name === 'AbortError' ||
      error?.networkError?.name === 'AbortError' ||
      message?.includes('aborted') ||
      message?.includes('AbortError')
    );
  };

  const cancelActiveRequests = () => {
    activeControllersRef.current.forEach((controller) => controller.abort());
    activeControllersRef.current = [];
  };

  const closeUploadDialog = () => {
    uploadSessionRef.current += 1;
    isUploadDialogOpenRef.current = false;
    cancelActiveRequests();
    setLoading(false);
    setFiles(formikValues.initialFiles.map(mapInitialFileToAssistantFile));
    setShowUploadDialog(false);
  };

  const uploadFile = async (
    file: File
  ): Promise<{ uploadedFile: UploadedFile | null; errorMessage: string | null; aborted: boolean }> => {
    let uploadedFile: UploadedFile | null = null;
    let errorMessage = null;
    let aborted = false;
    const controller = new AbortController();
    activeControllersRef.current.push(controller);

    await uploadFileToKaapi({
      variables: {
        media: file,
      },
      context: {
        options: {
          signal: controller.signal,
        },
        fetchOptions: {
          signal: controller.signal,
        },
      },
      onCompleted: ({ uploadFilesearchFile }) => {
        uploadedFile = {
          fileId: uploadFilesearchFile?.fileId,
          filename: uploadFilesearchFile?.filename,
          uploadedAt: uploadFilesearchFile?.uploadedAt,
          fileSize: uploadFilesearchFile?.fileSize,
        };
      },
      onError: (errors) => {
        if (isAbortError(errors)) {
          aborted = true;
          return;
        }
        errorMessage = errors.message;
      },
    }).finally(() => {
      activeControllersRef.current = activeControllersRef.current.filter((entry) => entry !== controller);
    });

    return { uploadedFile, errorMessage, aborted };
  };

  const getSortedFiles = (list: AssistantFile[]) => {
    const statusOrder: Record<FileStatus, number> = {
      uploading: 0,
      queued: 1,
      failed: 2,
      attached: 3,
    };

    return [...list].sort((first, second) => statusOrder[first.status] - statusOrder[second.status]);
  };

  const runUploadQueue = async (
    filesToUpload: File[],
    queuedFiles: AssistantFile[],
    sessionId: number
  ): Promise<{ uploadedFiles: AssistantFile[]; hasFailures: boolean }> => {
    let cursor = 0;
    let activeUploads = 0;
    const uploadedFiles: AssistantFile[] = [];
    let hasFailures = false;
    const isCurrentSession = () => isUploadDialogOpenRef.current && uploadSessionRef.current === sessionId;

    return new Promise((resolve) => {
      const processNext = () => {
        if (!isCurrentSession()) {
          if (activeUploads === 0) {
            resolve({ uploadedFiles, hasFailures });
          }
          return;
        }

        while (activeUploads < MAX_CONCURRENT_UPLOADS && cursor < filesToUpload.length) {
          const currentIndex = cursor;
          cursor += 1;
          activeUploads += 1;
          const queuedFile = queuedFiles[currentIndex];
          const currentFile = filesToUpload[currentIndex];

          if (isCurrentSession()) {
            setFiles((prevFiles) =>
              prevFiles.map((file) => (file.tempId === queuedFile.tempId ? { ...file, status: 'uploading' } : file))
            );
          }

          uploadFile(currentFile)
            .then(({ uploadedFile, errorMessage, aborted }) => {
              if (!isCurrentSession()) return;
              if (aborted) return;

              if (uploadedFile) {
                const attachedFile: AssistantFile = {
                  fileId: uploadedFile.fileId,
                  filename: uploadedFile.filename,
                  uploadedAt: uploadedFile.uploadedAt,
                  fileSize: uploadedFile.fileSize,
                  status: 'attached' as const,
                  tempId: queuedFile.tempId,
                };
                uploadedFiles.push(attachedFile);
                setFiles((prevFiles) =>
                  prevFiles.map((file) => (file.tempId === queuedFile.tempId ? attachedFile : file))
                );
              } else {
                hasFailures = true;
                setFiles((prevFiles) =>
                  prevFiles.map((file) =>
                    file.tempId === queuedFile.tempId
                      ? { ...file, status: 'failed', errorMessage: errorMessage || 'Failed to upload file' }
                      : file
                  )
                );
              }
            })
            .catch((uploadError) => {
              if (!isCurrentSession() || isAbortError(uploadError)) return;
              console.error('Error uploading file:', uploadError);
              hasFailures = true;
              setFiles((prevFiles) =>
                prevFiles.map((file) =>
                  file.tempId === queuedFile.tempId
                    ? { ...file, status: 'failed', errorMessage: uploadError?.message || 'Failed to upload file' }
                    : file
                )
              );
            })
            .finally(() => {
              activeUploads -= 1;
              if (cursor >= filesToUpload.length && activeUploads === 0) {
                resolve({ uploadedFiles, hasFailures });
                return;
              }

              processNext();
            });
        }

        if (cursor >= filesToUpload.length && activeUploads === 0) {
          resolve({ uploadedFiles, hasFailures });
        }
      };

      processNext();
    });
  };

  const handleFileChange = (event: any) => {
    const inputFiles = Array.from(event.target.files || []) as File[];
    if (inputFiles.length === 0) return;

    const activeFileCount = files.filter((file) => file.status !== 'failed').length;
    if (activeFileCount + inputFiles.length > MAX_FILES) {
      setNotification('You cannot upload more than 500 files.', 'warning');
      return;
    }

    const validFiles = inputFiles.filter((file) => {
      if (file.size / (1024 * 1024) > 20) {
        setNotification('File size should be less than 20MB', 'warning');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setLoading(true);
    const sessionId = uploadSessionRef.current;
    const queuedFiles = validFiles.map((file, index) => ({
      filename: file.name,
      status: 'queued' as const,
      tempId: `${file.name}-${Date.now()}-${index}`,
      errorMessage: '',
    }));

    setFiles((prevFiles) => [...prevFiles, ...queuedFiles]);

    runUploadQueue(validFiles, queuedFiles, sessionId)
      .then(({ hasFailures }) => {
        if (!isCurrentSessionRef(sessionId)) return;
        if (hasFailures) {
          setNotification('Some file uploads failed, hover the failure to see the reason', 'warning');
        }
      })
      .catch((error) => {
        if (isAbortError(error)) return;
        console.error('Error uploading files:', error);
      })
      .finally(() => {
        if (!isCurrentSessionRef(sessionId)) return;
        setLoading(false);
      });
  };

  const isCurrentSessionRef = (sessionId: number) =>
    isUploadDialogOpenRef.current && uploadSessionRef.current === sessionId;

  const handleRemoveFile = (file: AssistantFile) => {
    setFiles(files.filter((fileItem) => fileItem.tempId !== file.tempId));
  };

  const hasFilesChanged = () => {
    const attachedFiles = files.filter((file) => file.status === 'attached');
    if (attachedFiles.length !== formikValues.initialFiles.length) {
      return true;
    }

    const initialFileIds = new Set(formikValues.initialFiles.map((file: any) => file.fileId));
    return attachedFiles.some((file) => !file.fileId || !initialFileIds.has(file.fileId));
  };

  const handleFileUpload = () => {
    if (files.some((file) => file.status === 'failed')) {
      setNotification('Remove or re-upload files that failed before saving.', 'warning');
      return;
    }

    if (!hasFilesChanged()) {
      setShowUploadDialog(false);
      return;
    }

    const attachedFiles = files
      .filter((file) => file.status === 'attached')
      .map(({ status, tempId, ...rest }) => rest)
      .filter(
        (file, index, allFiles) =>
          allFiles.findIndex(
            (entry) =>
              entry.fileId === file.fileId && entry.filename === file.filename && entry.uploadedAt === file.uploadedAt
          ) === index
      );

    const controller = new AbortController();
    activeControllersRef.current.push(controller);

    createKnowledgeBase({
      variables: {
        createKnowledgeBaseId: knowledgeBaseId || null,
        mediaInfo: attachedFiles,
      },
      context: {
        options: {
          signal: controller.signal,
        },
        fetchOptions: {
          signal: controller.signal,
        },
      },
      onCompleted: ({ createKnowledgeBase: knowledgeBaseData }) => {
        const updatedFiles = files
          .filter((file) => file.status === 'attached')
          .map(({ status, tempId, ...rest }) => rest);
        setFiles(updatedFiles.map(mapInitialFileToAssistantFile));
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
        if (isAbortError(error)) return;
        setErrorMessage(error);
      },
    }).finally(() => {
      activeControllersRef.current = activeControllersRef.current.filter((entry) => entry !== controller);
    });
  };

  let dialog;
  if (showUploadDialog) {
    dialog = (
      <DialogBox
        open={showUploadDialog}
        title={t('Manage Files')}
        handleCancel={closeUploadDialog}
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
              {getSortedFiles(files).map((file, index) => (
                <div data-testid="fileItem" className={styles.File} key={file.fileId || file.tempId || index}>
                  <div>
                    <FileIcon />
                    <span>{file.filename}</span>
                  </div>
                  <div className={styles.FileActions}>
                    {file.status === 'uploading' && <CircularProgress data-testid="uploadingIcon" size={20} />}
                    {file.status === 'queued' && (
                      <AccessTimeIcon data-testid="queuedIcon" className={styles.QueuedIcon} fontSize="small" />
                    )}
                    {file.status === 'failed' && (
                      <Tooltip title={file.errorMessage || 'Failed to upload file'} placement="top" arrow>
                        <ErrorOutlineIcon data-testid="failedIcon" className={styles.FailedIcon} fontSize="small" />
                      </Tooltip>
                    )}
                    <IconButton
                      data-testid="deleteFile"
                      disabled={loading || file.status === 'uploading' || file.status === 'queued'}
                      onClick={() => handleRemoveFile(file)}
                    >
                      <CrossIcon />
                    </IconButton>
                  </div>
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
