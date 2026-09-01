import { useLazyQuery, useMutation } from '@apollo/client';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setErrorMessage, setNotification } from 'common/notification';
import { copyToClipboard, downloadFile } from 'common/utils';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Button } from 'components/UI/Form/Button/Button';
import { IconButton } from 'components/UI/IconButton/IconButton';
import type { KnowledgeBaseFile, UploadError } from 'containers/AIEvaluation/types/knowledgeBaseType';
import { UPLOAD_FILE_TO_KAAPI } from 'graphql/mutations/Assistant';
import { GET_KNOWLEDGE_BASE_FILE } from 'graphql/queries/Assistant';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CopyIcon from 'assets/images/CopyGreen.svg?react';
import DocumentIcon from 'assets/images/icons/Document/Dark.svg?react';
import SettingsIcon from 'assets/images/icons/Settings/Settings.svg?react';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import styles from './KnowledgeBase.module.css';

export interface KnowledgeBaseProps {
  files: KnowledgeBaseFile[];
  onFilesChange: (files: KnowledgeBaseFile[]) => void;
  onFilesUploaded: (uploaded: KnowledgeBaseFile[]) => void;
  uploading: string[];
  onUploadingChange: (names: string[]) => void;
  vectorStoreId?: string | null;
  legacy?: boolean;
}

const MAX_CONCURRENT_UPLOADS = 10;
const MAX_RETRY_ATTEMPTS = 5;
const INITIAL_BACKOFF_MS = 2000;
const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = '.csv,.doc,.docx,.html,.htm,.md,.markdown,.pdf,.txt';

const isRateLimitError = (error: unknown) => {
  const failure = error as UploadError | null;
  const status = failure?.networkError?.statusCode ?? failure?.networkError?.status;
  const code = failure?.graphQLErrors?.[0]?.extensions?.code;
  const message = failure?.message ?? failure?.networkError?.message ?? '';

  return (
    status === 429 ||
    code === 'TOO_MANY_REQUESTS' ||
    message.includes('429') ||
    message.toLowerCase().includes('too many requests')
  );
};

const withLowercaseExtension = (file: File) => {
  const dot = file.name.lastIndexOf('.');
  if (dot < 1) return file;

  const extension = file.name.slice(dot + 1);
  if (extension === extension.toLowerCase()) return file;

  return new File([file], `${file.name.slice(0, dot)}.${extension.toLowerCase()}`, { type: file.type });
};

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const formatSize = (bytes?: number | null) => {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

export const KnowledgeBase = ({
  files,
  onFilesChange,
  onFilesUploaded,
  uploading,
  onUploadingChange,
  vectorStoreId = null,
  legacy = false,
}: KnowledgeBaseProps) => {
  const { t } = useTranslation();

  const [fileToRemove, setFileToRemove] = useState<KnowledgeBaseFile | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadFile] = useMutation(UPLOAD_FILE_TO_KAAPI);
  const [fetchFile] = useLazyQuery(GET_KNOWLEDGE_BASE_FILE, { fetchPolicy: 'network-only' });

  const handleDownload = async (file: KnowledgeBaseFile) => {
    setDownloading(file.fileId);

    try {
      const { data, error } = await fetchFile({ variables: { fileId: file.fileId } });

      if (error) {
        setErrorMessage(error);
        return;
      }

      const errors = data?.getFile?.errors;
      if (errors?.length) {
        setErrorMessage(errors[0]);
        return;
      }

      const signedUrl = data?.getFile?.signedUrl;
      if (!signedUrl) {
        setNotification(t('This file has no download link yet. Try again in a moment.'), 'warning');
        return;
      }

      downloadFile(signedUrl, data?.getFile?.filename || file.filename);
    } catch (error: unknown) {
      setErrorMessage(error);
    } finally {
      setDownloading(null);
    }
  };

  const isUploading = uploading.length > 0;
  const isReadOnly = legacy;

  const uploadOne = async (file: File): Promise<KnowledgeBaseFile | null> => {
    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const response = await uploadFile({ variables: { media: file } });
        const result = response.data?.uploadFilesearchFile;
        if (!result) return null;
        return {
          fileId: result.fileId,
          filename: result.filename,
          fileSize: result.fileSize,
          uploadedAt: result.uploadedAt,
        };
      } catch (error: unknown) {
        if (!isRateLimitError(error) || attempt >= MAX_RETRY_ATTEMPTS) throw error;
        // eslint-disable-next-line no-await-in-loop
        await sleep(INITIAL_BACKOFF_MS * 2 ** (attempt - 1));
      }
    }

    return null;
  };

  /** runs at most MAX_CONCURRENT_UPLOADS at a time and reports every outcome */
  const uploadAll = async (files: File[]) => {
    const results: { name: string; file: KnowledgeBaseFile | null }[] = [];
    let cursor = 0;

    const worker = async () => {
      while (cursor < files.length) {
        const file = files[cursor];
        cursor += 1;
        try {
          // eslint-disable-next-line no-await-in-loop
          const uploaded = await uploadOne(file);
          results.push({ name: file.name, file: uploaded });
        } catch (error: unknown) {
          setErrorMessage(error);
          results.push({ name: file.name, file: null });
        }
      }
    };

    await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENT_UPLOADS, files.length) }, worker));
    return results;
  };

  const handleAddFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []).map(withLowercaseExtension);
    // let the same file be picked again after a failure
    event.target.value = '';
    if (selected.length === 0) return;

    const oversized = selected.filter((file) => file.size > MAX_FILE_SIZE_BYTES);
    if (oversized.length > 0) {
      setNotification(
        `${oversized.map((file) => file.name).join(', ')} ${t('is larger than')} ${MAX_FILE_SIZE_MB}MB`,
        'warning'
      );
      return;
    }

    onUploadingChange(selected.map((file) => file.name));

    const results = await uploadAll(selected);
    const uploaded = results.flatMap((result) => (result.file ? [result.file] : []));
    const failed = results.filter((result) => !result.file);

    onUploadingChange([]);

    if (uploaded.length > 0) {
      onFilesUploaded(uploaded);
      setNotification(t('Files uploaded — save a version to apply them'));
    }

    if (failed.length > 0) {
      setNotification(
        `${failed.map((result) => result.name).join(', ')} ${t('could not be uploaded. Try again.')}`,
        'warning'
      );
    }
  };

  const handleRemoveConfirm = () => {
    if (!fileToRemove) return;
    onFilesChange(files.filter((file) => file.fileId !== fileToRemove.fileId));
    setFileToRemove(null);
    setNotification(t('File removed — save a version to apply it'));
  };

  const fileCount = `${files.length} ${files.length === 1 ? t('file attached') : t('files attached')}`;

  return (
    <div className={styles.Zone} data-testid="knowledgeBase">
      <div className={styles.ZoneHeader}>
        <div className={styles.ZoneTitle}>{t('Knowledge base')}</div>
        <div className={styles.ZoneSub} data-testid="fileCount">
          {fileCount}
          {isUploading && ` · ${uploading.length} ${t('processing')}`}
        </div>
        <div className={styles.ZoneAction}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isReadOnly}
            data-testid="addFilesButton"
          >
            + {t('Add files')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            accept={ACCEPTED_TYPES}
            onChange={handleAddFiles}
            data-testid="fileInput"
          />
          {!isReadOnly && (
            <div className={styles.FormatsHint} data-testid="supportedFormats">
              {t('Supports PDF, DOC, DOCX, TXT, MD, HTML and CSV · {{size}}MB per file', {
                size: MAX_FILE_SIZE_MB,
              })}
            </div>
          )}
        </div>
      </div>

      <div className={styles.Card}>
        {isReadOnly ? (
          <div className={styles.Note} data-testid="legacyNotice">
            {t('This assistant was created before the knowledge base rewrite, so its files are read-only.')}
          </div>
        ) : (
          <div className={styles.Note}>
            {t(
              'These are the documents the assistant can search when answering. Changes apply when you save a version.'
            )}
          </div>
        )}

        <div className={styles.FileList}>
          {files.map((file) => (
            <div className={styles.File} key={file.fileId} data-testid="knowledgeBaseFile">
              <div className={styles.FileIcon}>
                <DocumentIcon />
              </div>
              <div className={styles.FileText}>
                <div className={styles.FileName}>{file.filename}</div>
                {formatSize(file.fileSize) && <div className={styles.Note}>{formatSize(file.fileSize)}</div>}
              </div>
              <div className={styles.FileActions}>
                <IconButton
                  size="small"
                  className={`${styles.FileAction} ${styles.FileActionDownload}`}
                  onClick={() => handleDownload(file)}
                  loading={downloading === file.fileId}
                  aria-label={t('Download')}
                  data-testid="downloadFileButton"
                >
                  <FileDownloadOutlinedIcon />
                </IconButton>
                {!isReadOnly && (
                  <IconButton
                    size="small"
                    className={`${styles.FileAction} ${styles.FileActionDanger}`}
                    onClick={() => setFileToRemove(file)}
                    disabled={isUploading}
                    aria-label={t('Remove')}
                    data-testid="removeFileButton"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </div>
            </div>
          ))}

          {uploading.map((name) => (
            <div className={`${styles.File} ${styles.FileUploading}`} key={name} data-testid="uploadingFile">
              <span className={styles.Pulse} />
              <div className={styles.FileText}>
                <div className={styles.FileName}>{name}</div>
                <div className={styles.Note}>{t('Uploading…')}</div>
              </div>
            </div>
          ))}

          {files.length === 0 && !isUploading && (
            <div className={styles.EmptyState} data-testid="knowledgeBaseEmpty">
              {t('No files added yet. Add files for the assistant to use when answering questions.')}
            </div>
          )}
        </div>

        <div className={styles.TechnicalDetails}>
          <button
            type="button"
            className={styles.TechnicalToggle}
            onClick={() => setShowTechnical((open) => !open)}
            data-testid="technicalDetailsToggle"
          >
            <SettingsIcon className={`${styles.ToggleIcon} ${styles.GearIcon}`} />
            {t('Knowledge Base ID')}
            {showTechnical ? (
              <ExpandMoreIcon className={styles.ToggleIcon} />
            ) : (
              <ChevronRightIcon className={styles.ToggleIcon} />
            )}
          </button>

          {showTechnical &&
            (vectorStoreId ? (
              <>
                <div className={styles.VectorStoreId} data-testid="vectorStoreId">
                  <span className={styles.VectorStoreValue}>{vectorStoreId}</span>
                  <IconButton
                    size="small"
                    className={styles.FileAction}
                    onClick={() => copyToClipboard(vectorStoreId)}
                    aria-label={t('Copy')}
                    data-testid="copyVectorStoreId"
                  >
                    <CopyIcon />
                  </IconButton>
                </div>
                <div className={styles.Note}>
                  {t(
                    "This is the ID of the knowledge base the assistant searches at runtime — you shouldn't need it unless you're debugging with engineering."
                  )}
                </div>
              </>
            ) : (
              <div className={styles.NoVectorStore} data-testid="noVectorStore">
                {t('No knowledge base yet — one is created when you add your first file.')}
              </div>
            ))}
        </div>
      </div>

      {fileToRemove && (
        <DialogBox
          title={`${t('Remove')} ${fileToRemove.filename}?`}
          handleCancel={() => setFileToRemove(null)}
          handleOk={handleRemoveConfirm}
          buttonOk={t('Remove file')}
          alignButtons="center"
          colorOk="warning"
        >
          <div>{t('The file is detached when you save the next version.')}</div>
        </DialogBox>
      )}
    </div>
  );
};

export default KnowledgeBase;
