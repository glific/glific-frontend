import { useState } from 'react';
import AudiotrackOutlinedIcon from '@mui/icons-material/AudiotrackOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import { t } from 'i18next';

import styles from '../HSMListV2/HSMListV2.module.css';

const staticMediaFallback: Record<string, { icon: any; label: string }> = {
  DOCUMENT: { icon: <InsertDriveFileOutlinedIcon className={styles.PreviewMediaIcon} />, label: t('Document') },
  AUDIO: { icon: <AudiotrackOutlinedIcon className={styles.PreviewMediaIcon} />, label: t('Audio') },
};

export const PreviewMedia = ({ media, type }: { media: any; type?: string }) => {
  const [errored, setErrored] = useState(false);

  if (!media || !media.sourceUrl) return null;

  const staticFallback = type ? staticMediaFallback[type] : undefined;
  if (staticFallback) {
    return (
      <div className={styles.PreviewMedia}>
        <div
          className={`${styles.PreviewMediaFallback} ${styles.PreviewMediaFallbackColumn}`}
          data-testid="preview-media-fallback"
        >
          {staticFallback.icon}
          <span className={styles.PreviewMediaFallbackLabel}>{media.caption || staticFallback.label}</span>
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
