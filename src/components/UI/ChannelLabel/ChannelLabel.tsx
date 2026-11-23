import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import WebIcon from '@mui/icons-material/LanguageOutlined';

import { MESSAGE_CHANNELS, MessageChannel } from 'common/constants';
import styles from './ChannelLabel.module.css';

export interface ChannelLabelProps {
  channel?: MessageChannel | null;
  variant?: 'inline' | 'chip';
  testId?: string;
  /** The channel's logo in place of the coloured dot. */
  icon?: boolean;
}

const CHANNEL_DETAILS: Record<
  MessageChannel,
  { label: string; dotClass: string; chipClass: string; Icon: typeof WhatsAppIcon }
> = {
  [MESSAGE_CHANNELS.whatsapp]: {
    label: 'WhatsApp',
    dotClass: styles.WhatsApp,
    chipClass: styles.WhatsAppChip,
    Icon: WhatsAppIcon,
  },
  [MESSAGE_CHANNELS.web]: { label: 'Web', dotClass: styles.Web, chipClass: styles.WebChip, Icon: WebIcon },
};

export const ChannelLabel = ({
  channel,
  variant = 'inline',
  testId = 'channelLabel',
  icon = false,
}: ChannelLabelProps) => {
  const known = channel == null ? CHANNEL_DETAILS[MESSAGE_CHANNELS.whatsapp] : CHANNEL_DETAILS[channel];
  const { label, dotClass, chipClass, Icon } = known ?? {
    label: channel as string,
    dotClass: '',
    chipClass: '',
    Icon: null,
  };

  const isChip = variant === 'chip';

  return (
    <div className={`${styles.ChannelLabel} ${isChip ? `${styles.Chip} ${chipClass}` : ''}`} data-testid={testId}>
      {icon && Icon ? (
        <Icon className={styles.Icon} aria-hidden="true" data-testid="channelIcon" />
      ) : (
        <span className={`${styles.Dot} ${dotClass}`} aria-hidden="true" />
      )}
      {label}
    </div>
  );
};

export default ChannelLabel;
