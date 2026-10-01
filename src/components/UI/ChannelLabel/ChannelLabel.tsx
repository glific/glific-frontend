import { MESSAGE_CHANNELS, MessageChannel } from 'common/constants';
import styles from './ChannelLabel.module.css';

export interface ChannelLabelProps {
  channel?: MessageChannel | null;
  variant?: 'inline' | 'chip';
  testId?: string;
}

const CHANNEL_DETAILS: Record<MessageChannel, { label: string; dotClass: string; chipClass: string }> = {
  [MESSAGE_CHANNELS.whatsapp]: { label: 'WhatsApp', dotClass: styles.WhatsApp, chipClass: styles.WhatsAppChip },
  [MESSAGE_CHANNELS.web]: { label: 'Web', dotClass: styles.Web, chipClass: styles.WebChip },
};

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
