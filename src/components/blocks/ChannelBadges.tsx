import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { CHANNEL_WEB, CHANNEL_WHATSAPP, getSupportedChannels } from 'common/constants';
import styles from './ChannelBadges.module.css';

/**
 * Derived, read-only channel badges (contract §11).
 *
 * Pure presentation over a derived value — never an authoring choice, and never validated.
 * Pass `templateType` for an interactive template, or `channels` when the caller derives the
 * list itself (the flow form, whose source is `flow_type`).
 */
export interface ChannelBadgesProps {
  templateType?: string;
  channels?: string[];
  /** Table variant: no icon, so the column stays narrow. */
  compact?: boolean;
}

export const ChannelBadges = ({ templateType, channels, compact = false }: ChannelBadgesProps) => (
  <span className={styles.Badges} data-testid="channelBadges">
    {(channels ?? getSupportedChannels(templateType ?? '')).map((channel: string) => (
      <span
        key={channel}
        className={[
          styles.ChannelTag,
          channel === CHANNEL_WEB ? styles.ChannelTagWeb : styles.ChannelTagWhatsapp,
          compact ? '' : styles.ChannelTagWithIcon,
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={channel === CHANNEL_WHATSAPP ? 'channelBadgeWhatsapp' : 'channelBadgeWeb'}
        title={`Delivered on ${channel}`}
      >
        {!compact && <LocalOfferIcon className={styles.ChannelTagIcon} />}
        {channel}
      </span>
    ))}
  </span>
);

export default ChannelBadges;
