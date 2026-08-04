import { useMutation } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setErrorMessage, setNotification } from 'common/notification';
import { copyToClipboard } from 'common/utils';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Button } from 'components/UI/Form/Button/Button';
import { IconButton } from 'components/UI/IconButton/IconButton';
import { CREATE_KNOWLEDGE_BASE, UPLOAD_FILE_TO_KAAPI } from 'graphql/mutations/Assistant';
import CopyIcon from 'assets/images/CopyGreen.svg?react';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import styles from './KnowledgeBase.module.css';

export interface KnowledgeBaseFile {
  fileId: string;
  filename: string;
  fileSize?: number | null;
  uploadedAt?: string | null;
}

export interface KnowledgeBaseProps {
  files: KnowledgeBaseFile[];
  knowledgeBaseId?: string | null;
  vectorStoreId?: string | null;
  legacy?: boolean;
  onKnowledgeBaseChange?: (knowledgeBaseVersionId: string, files: KnowledgeBaseFile[]) => void;
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
  knowledgeBaseId = null,
  vectorStoreId = null,
  legacy = false,
  onKnowledgeBaseChange,
}: KnowledgeBaseProps) => {
  const { t } = useTranslation();

  const [attachedFiles, setAttachedFiles] = useState<KnowledgeBaseFile[]>(files);
  const [uploadingNames, setUploadingNames] = useState<string[]>([]);
  const [fileToRemove, setFileToRemove] = useState<KnowledgeBaseFile | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadFile] = useMutation(UPLOAD_FILE_TO_KAAPI);
  const [createKnowledgeBase, { loading: rebuilding }] = useMutation(CREATE_KNOWLEDGE_BASE);

  // the assistant query can resolve after the first render, so keep the list in step
  useEffect(() => {
    setAttachedFiles(files);
  }, [JSON.stringify(files)]);

  const isBusy = uploadingNames.length > 0 || rebuilding;
  const isReadOnly = legacy;

  const rebuild = async (mediaInfo: KnowledgeBaseFile[], successMessage: string) => {
    const response = await createKnowledgeBase({
      variables: { createKnowledgeBaseId: knowledgeBaseId, mediaInfo },
    });
    const knowledgeBase = response.data?.createKnowledgeBase?.knowledgeBase;
    setAttachedFiles(mediaInfo);
    onKnowledgeBaseChange?.(knowledgeBase?.knowledgeBaseVersionId, mediaInfo);
    setNotification(successMessage);
  };

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

    setUploadingNames(selected.map((file) => file.name));

    try {
      const uploaded = await Promise.all(
        selected.map(async (file) => {
          const response = await uploadFile({ variables: { media: file } });
          return response.data?.uploadFilesearchFile as KnowledgeBaseFile;
        })
      );

      await rebuild(
        [...attachedFiles, ...uploaded.filter(Boolean)],
        t('Files added — the knowledge base is rebuilding')
      );
    } catch (error: unknown) {
      setErrorMessage(error);
    } finally {
      setUploadingNames([]);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!fileToRemove) return;
    const remaining = attachedFiles.filter((file) => file.fileId !== fileToRemove.fileId);
    setFileToRemove(null);

    try {
      await rebuild(remaining, t('File removed — the knowledge base is rebuilding'));
    } catch (error: unknown) {
      setErrorMessage(error);
    }
  };

  const fileCount = `${attachedFiles.length} ${attachedFiles.length === 1 ? t('file attached') : t('files attached')}`;

  return (
    <div className={styles.Zone} data-testid="knowledgeBase">
      <div className={styles.ZoneHeader}>
        <div className={styles.ZoneTitle}>{t('Knowledge base')}</div>
        <div className={styles.ZoneSub} data-testid="fileCount">
          {fileCount}
          {uploadingNames.length > 0 && ` · ${uploadingNames.length} ${t('processing')}`}
        </div>
        <div className={styles.ZoneAction}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy || isReadOnly}
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
              'These are the documents the assistant can search when answering. Adding or removing a file takes a minute or two to process.'
            )}
          </div>
        )}

        <div className={styles.FileList}>
          {attachedFiles.map((file) => (
            <div className={styles.File} key={file.fileId} data-testid="knowledgeBaseFile">
              <div className={styles.FileIcon}>📄</div>
              <div className={styles.FileText}>
                <div className={styles.FileName}>{file.filename}</div>
                {formatSize(file.fileSize) && <div className={styles.Note}>{formatSize(file.fileSize)}</div>}
              </div>
              {!isReadOnly && (
                <IconButton
                  size="small"
                  className={styles.FileAction}
                  onClick={() => setFileToRemove(file)}
                  disabled={isBusy}
                  aria-label={t('Remove')}
                  data-testid="removeFileButton"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </div>
          ))}

          {uploadingNames.map((name) => (
            <div className={`${styles.File} ${styles.FileUploading}`} key={name} data-testid="uploadingFile">
              <span className={styles.Pulse} />
              <div className={styles.FileText}>
                <div className={styles.FileName}>{name}</div>
                <div className={styles.Note}>
                  {t('Processing — this runs in the background; you can keep working.')}
                </div>
              </div>
            </div>
          ))}

          {attachedFiles.length === 0 && uploadingNames.length === 0 && (
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
          <div>{t('The file is detached and the knowledge base is rebuilt without it.')}</div>
        </DialogBox>
      )}
    </div>
  );
};

export default KnowledgeBase;
