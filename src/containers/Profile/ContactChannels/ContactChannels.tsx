import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { MessageChannel, SHORT_DATE_FORMAT, SHORT_TIME_FORMAT } from 'common/constants';
import { ChannelLabel } from 'components/UI/ChannelLabel/ChannelLabel';
import styles from './ContactChannels.module.css';

export interface ContactChannel {
  channel: MessageChannel;
  lastMessageAt: string | null;
}

export interface ContactChannelsProps {
  channels: ContactChannel[];
  /** The times are one profile's: its inbound messages while it was the contact's active profile. */
  perProfile?: boolean;
}

/**
 * The channels a contact uses, each with when the contact last messaged on it. The channels are
 * the contact's, shared by all its profiles; with `perProfile` the times are the selected
 * profile's own, so a profile that has never been active reads "No activity yet".
 */
export const ContactChannels = ({ channels, perProfile = false }: ContactChannelsProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.Channels} data-testid="contactChannels">
      <div className={styles.Title}>{t('Channels')}</div>

      {channels.length === 0 ? (
        <div className={styles.Empty} data-testid="noChannels">
          {t('No activity yet')}
        </div>
      ) : (
        <div className={styles.Table} role="table">
          <div className={`${styles.Row} ${styles.Header}`} role="row">
            <span role="columnheader">{t('Channel')}</span>
            <span role="columnheader">{t('Last activity')}</span>
          </div>

          {channels.map(({ channel, lastMessageAt }) => (
            <div className={styles.Row} role="row" key={channel} data-testid="channelRow">
              <span role="cell">
                <ChannelLabel channel={channel} variant="chip" icon />
              </span>
              <span role="cell" className={styles.Activity} data-testid="channelLastActivity">
                {lastMessageAt
                  ? `${dayjs(lastMessageAt).format(`${SHORT_DATE_FORMAT}, ${SHORT_TIME_FORMAT}`)} · ${t('inbound message')}`
                  : t('No activity yet')}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.Note}>
        {perProfile
          ? t("Last activity is this profile's most recent inbound message on that channel.")
          : t("Last activity is the contact's most recent inbound message on that channel.")}
      </div>
    </div>
  );
};

export default ContactChannels;
