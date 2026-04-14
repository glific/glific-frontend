import { useMutation } from '@apollo/client';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import { Button, CircularProgress, IconButton, Slider, Tooltip, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AddIcon from 'assets/images/AddGreenIcon.svg?react';
import DatabaseIcon from 'assets/images/database.svg?react';
import FileIcon from 'assets/images/FileGreen.svg?react';

import { setErrorMessage, setNotification } from 'common/notification';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import HelpIcon from 'components/UI/HelpIcon/HelpIcon';

import { CREATE_KNOWLEDGE_BASE, UPLOAD_FILE_TO_KAAPI } from 'graphql/mutations/Assistant';

import styles from './KnowledgeBaseOptions.module.css';
interface KnowledgeBaseOptionsProps {
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
  sourceFile?: File;
}

interface UploadedFile {
  fileId?: string;
  filename: string;
  uploadedAt?: string;
  fileSize?: number;
}

const MAX_CONCURRENT_UPLOADS = 10;
const MAX_RETRY_ATTEMPTS = 5;
const INITIAL_BACKOFF_MS = 2000;
const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const temperatureInfo =
  'Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.';
const filesInfo =
  'Enables the assistant with knowledge from files that you or your users upload. Once a file is uploaded, the assistant automatically decides when to retrieve content based on user requests.';

export const KnowledgeBaseOptions = ({
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
}: KnowledgeBaseOptionsProps) => {
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
  const uploadControllersRef = useRef<Map<string, AbortController>>(new Map());
  const pendingUploadQueueRef = useRef<
    Array<{ file: File; tempId: string; sessionId: number; resolveResult: (success: boolean) => void }>
  >([]);
  const activeUploadsRef = useRef(0);
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

  const isRateLimitError = (uploadError: any) => {
    const networkStatus = uploadError?.networkError?.statusCode || uploadError?.networkError?.status;
    const graphQLErrorCode = uploadError?.graphQLErrors?.[0]?.extensions?.code;
    const message = uploadError?.message || uploadError?.networkError?.message || '';

    return (
      networkStatus === 429 ||
      graphQLErrorCode === 'TOO_MANY_REQUESTS' ||
      message.includes('429') ||
      message.toLowerCase().includes('too many requests')
    );
  };

  const cancelActiveRequests = () => {
    activeControllersRef.current.forEach((controller) => controller.abort());
    activeControllersRef.current = [];
    uploadControllersRef.current.clear();
  };

  const sleepWithAbort = (durationMs: number, signal: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
      if (signal.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }

      const timeout = setTimeout(() => {
        signal.removeEventListener('abort', onAbort);
        resolve();
      }, durationMs);

      const onAbort = () => {
        clearTimeout(timeout);
        reject(new DOMException('Aborted', 'AbortError'));
      };

      signal.addEventListener('abort', onAbort, { once: true });
    });

  const updateLoadingFromStatuses = (sessionId: number) => {
    if (!isCurrentSessionRef(sessionId)) return;
    const hasQueuedForSession = pendingUploadQueueRef.current.some((queueItem) => queueItem.sessionId === sessionId);
    const hasActiveForSession = activeUploadsRef.current > 0;
    setLoading(hasQueuedForSession || hasActiveForSession);
  };

  const closeUploadDialog = () => {
    uploadSessionRef.current += 1;
    isUploadDialogOpenRef.current = false;
    pendingUploadQueueRef.current = [];
    cancelActiveRequests();
    setLoading(false);
    setFiles(formikValues.initialFiles.map(mapInitialFileToAssistantFile));
    setShowUploadDialog(false);
  };

  const uploadFile = async (
    file: File,
    tempId: string
  ): Promise<{ uploadedFile: UploadedFile | null; errorMessage: string | null; aborted: boolean }> => {
    let uploadedFile: UploadedFile | null = null;
    let errorMessage: string | null = null;
    let aborted = false;
    const controller = new AbortController();
    activeControllersRef.current.push(controller);
    uploadControllersRef.current.set(tempId, controller);

    const runAttempt = async () => {
      let attemptError: any = null;
      let uploadedData: any = null;
      const { data } = await uploadFileToKaapi({
        variables: {
          media: file,
        },
        context: {
          fetchOptions: {
            signal: controller.signal,
          },
        },
        onCompleted: (payload) => {
          uploadedData = payload?.uploadFilesearchFile;
        },
        onError: (uploadError) => {
          attemptError = uploadError;
        },
      });

      if (attemptError) {
        throw attemptError;
      }

      const responseData = uploadedData || data?.uploadFilesearchFile;
      uploadedFile = {
        fileId: responseData?.fileId,
        filename: responseData?.filename,
        uploadedAt: responseData?.uploadedAt,
        fileSize: responseData?.fileSize,
      };
    };

    try {
      for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
        try {
          await runAttempt();
          break;
        } catch (uploadError: any) {
          if (isAbortError(uploadError)) {
            aborted = true;
            break;
          }

          errorMessage = uploadError?.message || 'Failed to upload file';
          if (!isRateLimitError(uploadError) || attempt >= MAX_RETRY_ATTEMPTS) {
            break;
          }

          const backoffMs = INITIAL_BACKOFF_MS * 2 ** (attempt - 1);
          await sleepWithAbort(backoffMs, controller.signal);
        }
      }
    } catch (uploadError: any) {
      if (isAbortError(uploadError)) {
        aborted = true;
      } else {
        errorMessage = uploadError?.message || 'Failed to upload file';
      }
    } finally {
      activeControllersRef.current = activeControllersRef.current.filter((entry) => entry !== controller);
      uploadControllersRef.current.delete(tempId);
    }

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

  const processUploadQueue = () => {
    while (activeUploadsRef.current < MAX_CONCURRENT_UPLOADS && pendingUploadQueueRef.current.length > 0) {
      const nextUpload = pendingUploadQueueRef.current.shift();
      if (!nextUpload) return;

      const { file, tempId, sessionId, resolveResult } = nextUpload;
      if (!isCurrentSessionRef(sessionId)) {
        resolveResult(false);
        continue;
      }

      activeUploadsRef.current += 1;
      setFiles((prevFiles) =>
        prevFiles.map((fileItem) =>
          fileItem.tempId === tempId ? { ...fileItem, status: 'uploading', errorMessage: '' } : fileItem
        )
      );

      uploadFile(file, tempId)
        .then(({ uploadedFile, errorMessage, aborted }) => {
          if (!isCurrentSessionRef(sessionId) || aborted) {
            resolveResult(false);
            return;
          }

          if (uploadedFile) {
            const attachedFile: AssistantFile = {
              fileId: uploadedFile.fileId,
              filename: uploadedFile.filename,
              uploadedAt: uploadedFile.uploadedAt,
              fileSize: uploadedFile.fileSize,
              status: 'attached',
              tempId,
              sourceFile: file,
            };

            setFiles((prevFiles) =>
              prevFiles.map((fileItem) => (fileItem.tempId === tempId ? attachedFile : fileItem))
            );
            resolveResult(true);
            return;
          }

          setFiles((prevFiles) =>
            prevFiles.map((fileItem) =>
              fileItem.tempId === tempId
                ? { ...fileItem, status: 'failed', errorMessage: errorMessage || 'Failed to upload file' }
                : fileItem
            )
          );
          resolveResult(false);
        })
        .catch((uploadError) => {
          if (!isCurrentSessionRef(sessionId) || isAbortError(uploadError)) {
            resolveResult(false);
            return;
          }

          setFiles((prevFiles) =>
            prevFiles.map((fileItem) =>
              fileItem.tempId === tempId
                ? { ...fileItem, status: 'failed', errorMessage: uploadError?.message || 'Failed to upload file' }
                : fileItem
            )
          );
          resolveResult(false);
        })
        .finally(() => {
          activeUploadsRef.current -= 1;
          updateLoadingFromStatuses(sessionId);
          processUploadQueue();
        });
    }
  };

  const enqueueFilesForUpload = (uploadFiles: Array<{ sourceFile: File; tempId: string }>, sessionId: number) => {
    const uploadTasks = uploadFiles.map(({ sourceFile, tempId }) => {
      return new Promise<boolean>((resolveResult) => {
        pendingUploadQueueRef.current.push({ file: sourceFile, tempId, sessionId, resolveResult });
      });
    });

    processUploadQueue();
    return Promise.all(uploadTasks);
  };

  const handleFileChange = (event: any) => {
    const inputFiles = Array.from(event.target.files || []) as File[];
    if (inputFiles.length === 0) return;

    const oversizedFiles = inputFiles.filter((file) => file.size > MAX_FILE_SIZE_BYTES);
    if (oversizedFiles.length > 0) {
      const oversizedFileNames = oversizedFiles.map((file) => file.name).join(', ');
      const fileVerb = oversizedFiles.length > 1 ? 'are' : 'is';
      setNotification(`${oversizedFileNames} ${fileVerb} above 20MB`, 'warning');
      return;
    }

    setLoading(true);
    const sessionId = uploadSessionRef.current;
    const queuedFiles = inputFiles.map((file, index) => ({
      filename: file.name,
      status: 'queued' as const,
      tempId: `${file.name}-${Date.now()}-${index}`,
      errorMessage: '',
      sourceFile: file,
    }));

    setFiles((prevFiles) => [...prevFiles, ...queuedFiles]);

    enqueueFilesForUpload(
      queuedFiles.map((file) => ({ sourceFile: file.sourceFile as File, tempId: file.tempId })),
      sessionId
    )
      .then((results) => {
        if (!isCurrentSessionRef(sessionId)) return;
        const hasFailures = results.some((result) => !result);
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
        updateLoadingFromStatuses(sessionId);
      });
  };

  const isCurrentSessionRef = (sessionId: number) => uploadSessionRef.current === sessionId;

  const handleRemoveFile = (file: AssistantFile) => {
    const { tempId } = file;

    const removedQueueEntries = pendingUploadQueueRef.current.filter((queueItem) => queueItem.tempId === tempId);
    pendingUploadQueueRef.current = pendingUploadQueueRef.current.filter((queueItem) => queueItem.tempId !== tempId);
    removedQueueEntries.forEach(({ resolveResult }) => resolveResult(false));

    const uploadController = uploadControllersRef.current.get(tempId);
    if (uploadController) {
      uploadController.abort();
      uploadControllersRef.current.delete(tempId);
    }

    setFiles((prevFiles) => prevFiles.filter((fileItem) => fileItem.tempId !== tempId));
    updateLoadingFromStatuses(uploadSessionRef.current);
  };

  const handleRetryFile = (file: AssistantFile) => {
    if (!file.sourceFile) return;
    const sessionId = uploadSessionRef.current;
    setLoading(true);
    setFiles((prevFiles) =>
      prevFiles.map((fileItem) =>
        fileItem.tempId === file.tempId ? { ...fileItem, status: 'queued', errorMessage: '' } : fileItem
      )
    );
    enqueueFilesForUpload([{ sourceFile: file.sourceFile, tempId: file.tempId }], sessionId).finally(() => {
      updateLoadingFromStatuses(sessionId);
    });
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
      .map(({ status, tempId, sourceFile, ...rest }) => rest)
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
        fetchOptions: {
          signal: controller.signal,
        },
      },
      onCompleted: ({ createKnowledgeBase: knowledgeBaseData }) => {
        const updatedFiles = files
          .filter((file) => file.status === 'attached')
          .map(({ status, tempId, sourceFile, ...rest }) => rest);
        setFiles(updatedFiles.map(mapInitialFileToAssistantFile));
        setFieldValue('initialFiles', updatedFiles);
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
    }).finally(() => {
      activeControllersRef.current = activeControllersRef.current.filter((entry) => entry !== controller);
    });
  };

  let dialog;
  if (showUploadDialog) {
    dialog = (
      <DialogBox
        open={showUploadDialog}
        title={t('Manage Knowledge Base')}
        titleAlign="left"
        handleCancel={closeUploadDialog}
        buttonOk={fileUploadDisabled ? 'Close' : 'Proceed'}
        skipCancel={fileUploadDisabled}
        handleOk={handleFileUpload}
        disableOk={addingFiles || loading || files.length === 0}
        buttonOkLoading={addingFiles || loading}
        fullWidth
        customStyles={{ content: 'kb-dialog-content' }}
      >
        <div className={styles.DialogContent}>
          {isLegacyVectorStore ? (
            <p data-testid="readOnlyNote" className={styles.ReadOnlyNote}>
              This assistant was created before 10/03/2026. Knowledge base files for old assistants are read-only. You
              can edit Knowledge base by cloning this assistant. It will copy the prompt and other settings, and
              re-upload the files in the new assistant.
            </p>
          ) : (
            <>
              <p className={styles.DialogSubtitle}>{t('You are adding more files to existing Knowledge Base')}</p>
              <div className={styles.DialogBody}>
                <div className={styles.FileSection}>
                  <div className={styles.FileSectionHeader}>
                    <span className={styles.FileSectionTitle}>{t('Selected File(s)')}</span>
                    <Button
                      component="label"
                      variant="outlined"
                      className={styles.AddFilesButton}
                      disabled={fileUploadDisabled}
                      tabIndex={-1}
                    >
                      <AddIcon />
                      {t('Add Files')}
                      <input
                        data-testid="uploadFile"
                        type="file"
                        accept=".csv,.doc,.docx,.html,.java,.md,.pdf,.pptx,.txt"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        multiple
                        disabled={fileUploadDisabled}
                      />
                    </Button>
                  </div>

                  <div className={styles.FileList}>
                    {getSortedFiles(files).map((file, index) => (
                      <div data-testid="fileItem" className={styles.File} key={file.fileId || file.tempId || index}>
                        <div className={styles.FileLeadingIcon}>
                          {file.status === 'uploading' ? (
                            <CircularProgress data-testid="uploadingIcon" size={18} />
                          ) : (
                            <FileIcon />
                          )}
                        </div>
                        <div className={styles.FileName}>{file.filename}</div>
                        <div className={styles.FileActions}>
                          <div className={styles.ActionSlot}>
                            {file.sourceFile && (
                              <>
                                {file.status === 'queued' && (
                                  <AccessTimeIcon
                                    data-testid="queuedIcon"
                                    className={styles.QueuedIcon}
                                    fontSize="small"
                                  />
                                )}
                                {file.status === 'failed' && (
                                  <>
                                    <Tooltip title={file.errorMessage || 'Failed to upload file'} placement="top" arrow>
                                      <ErrorOutlineIcon
                                        data-testid="failedIcon"
                                        className={styles.FailedIcon}
                                        fontSize="small"
                                      />
                                    </Tooltip>
                                    <Tooltip title="Retry upload" placement="top" arrow>
                                      <span>
                                        <IconButton
                                          data-testid="retryFile"
                                          className={styles.RetryButton}
                                          onClick={() => handleRetryFile(file)}
                                        >
                                          <ReplayIcon className={styles.RetryIcon} fontSize="small" />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  </>
                                )}
                                {file.status === 'attached' && (
                                  <CheckCircleIcon
                                    data-testid="attachedIcon"
                                    className={styles.SuccessIcon}
                                    fontSize="small"
                                  />
                                )}
                              </>
                            )}
                          </div>
                          <div className={styles.ActionSlot}>
                            <IconButton
                              className={styles.DeleteButton}
                              data-testid="deleteFile"
                              disabled={file.status === 'uploading'}
                              onClick={() => handleRemoveFile(file)}
                            >
                              <DeleteOutlineIcon className={styles.DeleteIcon} fontSize="small" />
                            </IconButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.InfoSection}>
                  <p className={styles.InfoText}>
                    Information in the attached files will be available to this assistant.{' '}
                    <a
                      href="https://platform.openai.com/docs/assistants/tools/file-search/supported-files"
                      target="_blank"
                      rel="noreferrer"
                      className={styles.InfoLink}
                    >
                      Allowed file formats
                    </a>
                  </p>
                  <p className={styles.FileLimitText}>
                    <strong>Individual File Limit: {MAX_FILE_SIZE_MB}MB</strong>
                  </p>
                </div>
              </div>
            </>
          )}
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
                <span>{vectorStoreId || formikValues.knowledgeBaseName}</span>
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
            edit Knowledge base by cloning this assistant. It will copy the prompt and other settings, and re-upload the
            files in the new assistant.
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
              data-testid="sliderDisplay"
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
