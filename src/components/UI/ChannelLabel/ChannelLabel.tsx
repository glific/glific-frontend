import { MESSAGE_CHANNELS, MessageChannel } from 'common/constants';
import styles from './ChannelLabel.module.css';

export interface ChannelLabelProps {
  channel?: MessageChannel | null;
  /** `chip` is a filled badge for headers; `inline` is a bare dot + label for table cells. */
  variant?: 'inline' | 'chip';
  testId?: string;
}

const CHANNEL_DETAILS: Record<MessageChannel, { label: string; dotClass: string; chipClass: string }> = {
  [MESSAGE_CHANNELS.whatsapp]: { label: 'WhatsApp', dotClass: styles.WhatsApp, chipClass: styles.WhatsAppChip },
  [MESSAGE_CHANNELS.web]: { label: 'Web', dotClass: styles.Web, chipClass: styles.WebChip },
};

// A row with no channel reads as WhatsApp: the column defaults to whatsapp server-side, and
// anything cached or mocked before the field existed arrives here as undefined. A channel the
// frontend has not been taught yet is shown as itself — painting it WhatsApp would state
// something false about where the flow runs.
export const ChannelLabel = ({ channel, variant = 'inline', testId = 'channelLabel' }: ChannelLabelProps) => {
  const known = channel == null ? CHANNEL_DETAILS[MESSAGE_CHANNELS.whatsapp] : CHANNEL_DETAILS[channel];
  const { label, dotClass, chipClass } = known ?? { label: channel as string, dotClass: '', chipClass: '' };

  const isChip = variant === 'chip';

  return (
    <div className={`${styles.ChannelLabel} ${isChip ? `${styles.Chip} ${chipClass}` : ''}`} data-testid={testId}>
      <span className={`${styles.Dot} ${dotClass}`} aria-hidden="true" />
      {label}
    </div>
  );
};

export default ChannelLabel;
