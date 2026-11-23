import { useTranslation } from 'react-i18next';

import { MessageChannel } from 'common/constants';
import { ChannelLabel } from 'components/UI/ChannelLabel/ChannelLabel';
import styles from './ContactChannels.module.css';

export interface ContactChannel {
  channel: MessageChannel;
  active: boolean;
}

export interface ContactChannelsProps {
  channels: ContactChannel[];
}

/**
 * The channels shown on the contact profile, each marked active when the contact has an identity
 * on it.
 */
export const ContactChannels = ({ channels }: ContactChannelsProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.Channels} data-testid="contactChannels">
      <div className={styles.Title}>{t('Channels')}</div>

      <div className={styles.Table} role="table">
        <div className={`${styles.Row} ${styles.Header}`} role="row">
          <span role="columnheader">{t('Channel')}</span>
          <span role="columnheader">{t('Status')}</span>
        </div>

        {channels.map(({ channel, active }) => (
          <div className={styles.Row} role="row" key={channel} data-testid="channelRow">
            <span role="cell">
              <ChannelLabel channel={channel} variant="chip" icon />
            </span>
            <span role="cell" className={active ? styles.Active : styles.Inactive} data-testid="channelStatus">
              {active ? t('Active') : t('Not active')}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.Note}>{t('Active means the contact has an identity on that channel.')}</div>
    </div>
  );
};

export default ContactChannels;
