import { deriveBody } from 'containers/InteractiveMessage/Blocks.helper';
import { BlocksRenderer } from './BlocksRenderer';
import styles from './BlocksPreview.module.css';

/**
 * Web-widget-styled preview panel (contract §11). It replaces the draggable phone simulator for
 * Blocks types — the block is a web-channel message, so a WhatsApp phone frame would be
 * misleading. Read-only: nothing here is clickable.
 */
export interface BlocksPreviewProps {
  /** The typed envelope as it would be stored, or null while the payload is unparseable. */
  envelope: any;
  /** Parse/validation problems to surface instead of a stale render. */
  error?: string;
}

export const BlocksPreview = ({ envelope, error }: BlocksPreviewProps) => (
  <div className={styles.Panel} data-testid="blocksPreview">
    <div className={styles.Header}>
      <span className={styles.Title}>Web preview</span>
      <span className={styles.Channel}>Web</span>
    </div>

    <div className={styles.Surface}>
      {error || !envelope ? (
        <div className={styles.Error} data-testid="blocksPreviewError">
          {error || 'Nothing to preview yet.'}
        </div>
      ) : (
        <div className={styles.Bubble}>
          <BlocksRenderer content={envelope} />
        </div>
      )}
    </div>

    {envelope && !error && (
      <div className={styles.Derived} data-testid="blocksDerivedBody">
        <span className={styles.DerivedLabel}>Message preview text</span>
        <span className={styles.DerivedValue}>{deriveBody(envelope) || '—'}</span>
      </div>
    )}
  </div>
);

export default BlocksPreview;
