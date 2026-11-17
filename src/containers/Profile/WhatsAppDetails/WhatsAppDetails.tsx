import { useTranslation } from 'react-i18next';

import { CONTACT_STATUS, MESSAGE_CHANNELS, PROVIDER_STATUS } from 'common/constants';
import { ChannelLabel } from 'components/UI/ChannelLabel/ChannelLabel';
import styles from './WhatsAppDetails.module.css';

export interface WhatsAppDetailsProps {
  status: string | null;
  bspStatus: string | null;
}

const labelFor = (options: { id: string; label: string }[], id: string | null) =>
  options.find((option) => option.id === id)?.label ?? id ?? '-';

/** A contact's WhatsApp state. Read only: Meta sets it from what the contact does on WhatsApp. */
export const WhatsAppDetails = ({ status, bspStatus }: WhatsAppDetailsProps) => {
  const { t } = useTranslation();

  return (
    <section className={styles.Card} data-testid="whatsAppDetails">
      <ChannelLabel channel={MESSAGE_CHANNELS.whatsapp} variant="chip" />
      <p className={styles.Subtitle}>{t("Read only. Updated by Meta based on the contact's actions on WhatsApp.")}</p>

      <div className={styles.Tiles}>
        <div className={styles.Tile}>
          <span className={styles.TileLabel}>{t('Status')}</span>
          <span className={styles.TileValue} data-testid="whatsAppStatus">
            {labelFor(CONTACT_STATUS, status)}
          </span>
        </div>
        <div className={styles.Tile}>
          <span className={styles.TileLabel}>{t('Provider status')}</span>
          <span className={styles.TileValue} data-testid="whatsAppProviderStatus">
            {labelFor(PROVIDER_STATUS, bspStatus)}
          </span>
        </div>
      </div>
    </section>
  );
};

export default WhatsAppDetails;
