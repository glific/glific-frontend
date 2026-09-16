import { MESSAGE_CHANNELS, MessageChannel } from 'common/constants';
import styles from './ChannelLabel.module.css';

export interface ChannelLabelProps {
  channel?: MessageChannel | null;
  testId?: string;
}

const CHANNEL_DETAILS: Record<MessageChannel, { label: string; dotClass: string }> = {
  [MESSAGE_CHANNELS.whatsapp]: { label: 'WhatsApp', dotClass: styles.WhatsApp },
  [MESSAGE_CHANNELS.web]: { label: 'Web', dotClass: styles.Web },
};

// A row with no channel reads as WhatsApp: the column defaults to whatsapp server-side, and
// anything cached or mocked before the field existed arrives here as undefined. A channel the
// frontend has not been taught yet falls back the same way rather than blanking the row.
export const ChannelLabel = ({ channel, testId = 'channelLabel' }: ChannelLabelProps) => {
  const { label, dotClass } = CHANNEL_DETAILS[channel as MessageChannel] ?? CHANNEL_DETAILS[MESSAGE_CHANNELS.whatsapp];

  return (
    <div className={styles.ChannelLabel} data-testid={testId}>
      <span className={`${styles.Dot} ${dotClass}`} aria-hidden="true" />
      {label}
    </div>
  );
};

export default ChannelLabel;
