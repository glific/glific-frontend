import { ReactNode, useState } from 'react';
import AudiotrackOutlinedIcon from '@mui/icons-material/AudiotrackOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import { t } from 'i18next';

import styles from '../HSMListV2/HSMListV2.module.css';

const staticMediaIcon: Record<string, ReactNode> = {
  DOCUMENT: <InsertDriveFileOutlinedIcon className={styles.PreviewMediaIcon} />,
  AUDIO: <AudiotrackOutlinedIcon className={styles.PreviewMediaIcon} />,
};

const staticMediaLabel: Record<string, () => string> = {
  DOCUMENT: () => t('Document'),
  AUDIO: () => t('Audio'),
};

export const PreviewMedia = ({ media, type }: { media: any; type?: string }) => {
  const [errored, setErrored] = useState(false);

  if (!media || !media.sourceUrl) return null;

  const staticIcon = type ? staticMediaIcon[type] : undefined;
  if (staticIcon) {
    const label = type ? staticMediaLabel[type]?.() : undefined;
    return (
      <div className={styles.PreviewMedia}>
        <div
          className={`${styles.PreviewMediaFallback} ${styles.PreviewMediaFallbackColumn}`}
          data-testid="preview-media-fallback"
        >
          {staticIcon}
          <span className={styles.PreviewMediaFallbackLabel}>{media.caption || label}</span>
        </div>
      </div>
    );
  }

  if (errored) {
    const FallbackIcon = type === 'VIDEO' ? VideocamOutlinedIcon : ImageOutlinedIcon;
    return (
      <div className={styles.PreviewMedia}>
        <div className={styles.PreviewMediaFallback} data-testid="preview-media-fallback">
          <FallbackIcon className={styles.PreviewMediaIcon} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.PreviewMedia}>
      {type === 'VIDEO' ? (
        <video
          data-testid="preview-media-video"
          className={styles.PreviewMediaImage}
          src={media.sourceUrl}
          muted
          preload="metadata"
          onError={() => setErrored(true)}
        />
      ) : (
        <img
          className={styles.PreviewMediaImage}
          src={media.sourceUrl}
          alt={media.caption || ''}
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
};
