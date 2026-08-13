import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { CHANNEL_WEB, CHANNEL_WHATSAPP, getSupportedChannels } from 'common/constants';
import styles from './ChannelBadges.module.css';

/**
 * Derived, read-only channel badges for an interactive template type (contract §11).
 *
 * Mirrors the flow form's channel tag: glific green for WhatsApp, blue for Web. Pure
 * presentation over the type — never an authoring choice, and never validated.
 */
export interface ChannelBadgesProps {
  templateType: string;
  /** Table variant: no icon, so the column stays narrow. */
  compact?: boolean;
}

export const ChannelBadges = ({ templateType, compact = false }: ChannelBadgesProps) => (
  <span className={styles.Badges} data-testid="channelBadges">
    {getSupportedChannels(templateType).map((channel: string) => (
      <span
        key={channel}
        className={`${styles.ChannelTag} ${channel === CHANNEL_WEB ? styles.ChannelTagWeb : styles.ChannelTagWhatsapp}`}
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
