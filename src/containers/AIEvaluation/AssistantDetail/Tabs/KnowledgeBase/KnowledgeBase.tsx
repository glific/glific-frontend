import { useMutation } from '@apollo/client';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setErrorMessage, setNotification } from 'common/notification';
import { copyToClipboard } from 'common/utils';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Button } from 'components/UI/Form/Button/Button';
import { IconButton } from 'components/UI/IconButton/IconButton';
import { UPLOAD_FILE_TO_KAAPI } from 'graphql/mutations/Assistant';
import CopyIcon from 'assets/images/CopyGreen.svg?react';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import DownloadIcon from 'assets/images/icons/Download.svg?react';
import styles from './KnowledgeBase.module.css';

export interface KnowledgeBaseFile {
  fileId: string;
  filename: string;
  fileSize?: number | null;
  uploadedAt?: string | null;
}

export interface KnowledgeBaseProps {
  files: KnowledgeBaseFile[];
  onFilesChange: (files: KnowledgeBaseFile[]) => void;
  onFilesUploaded: (uploaded: KnowledgeBaseFile[]) => void;
  uploading: string[];
  onUploadingChange: (names: string[]) => void;
  vectorStoreId?: string | null;
  legacy?: boolean;
}

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = '.csv,.doc,.docx,.html,.htm,.md,.markdown,.pdf,.txt';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadFile] = useMutation(UPLOAD_FILE_TO_KAAPI);

  const isUploading = uploading.length > 0;
  const isReadOnly = legacy;

  const handleAddFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
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

    try {
      const uploaded = await Promise.all(
        selected.map(async (file) => {
          const response = await uploadFile({ variables: { media: file } });
          const result = response.data?.uploadFilesearchFile;
          if (!result) return null;
          return {
            fileId: result.fileId,
            filename: result.filename,
            fileSize: result.fileSize,
            uploadedAt: result.uploadedAt,
          } as KnowledgeBaseFile;
        })
      );

      onFilesUploaded(uploaded.filter((file): file is KnowledgeBaseFile => file !== null));
      setNotification(t('Files uploaded — save a version to apply them'));
    } catch (error: unknown) {
      setErrorMessage(error);
    } finally {
      onUploadingChange([]);
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
              <div className={styles.FileIcon}>📄</div>
              <div className={styles.FileText}>
                <div className={styles.FileName}>{file.filename}</div>
                {formatSize(file.fileSize) && <div className={styles.Note}>{formatSize(file.fileSize)}</div>}
              </div>
              <div className={styles.FileActions}>
                <IconButton
                  size="small"
                  className={styles.FileAction}
                  // TODO: needs a signed-url endpoint for assistant files; Golden QA has one
                  disabled
                  title={t('Downloads are not available yet')}
                  aria-label={t('Download')}
                  data-testid="downloadFileButton"
                >
                  <DownloadIcon />
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
              {t('No files yet. Add documents the assistant should answer from.')}
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
            ⚙ {t('Technical details')} {showTechnical ? '▾' : '▸'}
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
                    "This is the vector store the assistant searches at runtime — you shouldn't need it unless you're debugging with engineering."
                  )}
                </div>
              </>
            ) : (
              <div className={styles.NoVectorStore} data-testid="noVectorStore">
                {t('No vector store yet — one is created when you add your first file.')}
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
