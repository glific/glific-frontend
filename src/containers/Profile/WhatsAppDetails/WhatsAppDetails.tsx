import { useTranslation } from 'react-i18next';

import { MESSAGE_CHANNELS } from 'common/constants';
import { ChannelLabel } from 'components/UI/ChannelLabel/ChannelLabel';
import styles from './WhatsAppDetails.module.css';

export interface WhatsAppDetailsProps {
  status: string | null;
  bspStatus: string | null;
}

/**
 * A contact's WhatsApp state, as stored: its status, and its BSP status as the provider status.
 * Read only: Meta sets it from what the contact does on WhatsApp.
 */
export const WhatsAppDetails = ({ status, bspStatus }: WhatsAppDetailsProps) => {
  const { t } = useTranslation();

  return (
    <section className={styles.Card} data-testid="whatsAppDetails">
      <ChannelLabel channel={MESSAGE_CHANNELS.whatsapp} variant="chip" icon />
      <p className={styles.Subtitle}>{t("Read only. Updated by Meta based on the contact's actions on WhatsApp.")}</p>

      <div className={styles.Tiles}>
        <div className={styles.Tile}>
          <span className={styles.TileLabel}>{t('Status')}</span>
          <span className={styles.TileValue} data-testid="whatsAppStatus">
            {status ?? '-'}
          </span>
        </div>
        <div className={styles.Tile}>
          <span className={styles.TileLabel}>{t('Provider status')}</span>
          <span className={styles.TileValue} data-testid="whatsAppProviderStatus">
            {bspStatus ?? '-'}
          </span>
        </div>
      </div>
    </section>
  );
};

export default WhatsAppDetails;
