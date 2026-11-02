import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Autocomplete, Chip, Dialog, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import QRCode from 'react-qr-code';

import DownloadIcon from 'assets/images/icons/DownloadIcon.svg?react';
import logoSrc from 'assets/images/logo/Logo.svg';
import { MESSAGE_CHANNELS, MessageChannel, SHARE_FLOW_LINK } from 'common/constants';
import { setNotification } from 'common/notification';
import { copyToClipboardMethod, downloadCanvasAsPNG, webChannelUrl } from 'common/utils';
import { Button } from 'components/UI/Form/Button/Button';
import { GET_ORGANIZATION_SHORTCODE } from 'graphql/queries/Organization';
import { getUserSession } from 'services/AuthService';
import styles from './ShareResponderLink.module.css';

interface ShareResponderLinkProps {
  shareDialogKeywords: any[];
  handleClose: Function;
  channel?: MessageChannel;
}

const ShareResponderLink = ({
  shareDialogKeywords,
  handleClose,
  channel = MESSAGE_CHANNELS.whatsapp,
}: ShareResponderLinkProps) => {
  const [selectedKeyword, setSelectedKeyword] = useState(shareDialogKeywords[0]);
  const [flowLink, setFlowLink] = useState('');
  const isWeb = channel === MESSAGE_CHANNELS.web;

  const organization = getUserSession('organization');
  const botNumber = organization?.contact?.phone;

  const { data: shortcodeData } = useQuery(GET_ORGANIZATION_SHORTCODE, { skip: !isWeb });
  const webChatAddress = shortcodeData?.organization?.organization?.shortcode
    ? webChannelUrl(shortcodeData.organization.organization.shortcode, window.location.hostname)
    : '';

  // A web chat link sends its keyword as soon as the chat opens (?start=), where a wa.me link
  // only pre-fills it; the web chat starts the flow only if the keyword is a web flow's.
  const getFlowLink = (keyword: { label: string; id: number }) => {
    if (!isWeb) return `${SHARE_FLOW_LINK}${botNumber}?text=${keyword.label}`;
    return webChatAddress ? `${webChatAddress}/?start=${encodeURIComponent(keyword.label)}` : '';
  };

  const copyToClipboard = (text: string) => {
    copyToClipboardMethod(text);
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('flow-qr-code') as SVGElement | null;
    if (!svg) return;

    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const padding = 40;
        canvas.width = img.width + padding * 2;
        canvas.height = img.height + padding * 2;

        ctx!.fillStyle = '#ffffff';
        ctx!.fillRect(0, 0, canvas.width, canvas.height);

        ctx!.drawImage(img, padding, padding);

        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.onload = () => {
          const qrSize = img.width;
          const logoSize = Math.round(qrSize * 0.25);
          const logoX = padding + (qrSize - logoSize) / 2;
          const logoY = padding + (qrSize - logoSize) / 2;

          const logoRadius = logoSize / 2;
          const logoCenterX = logoX + logoRadius;
          const logoCenterY = logoY + logoRadius;

          ctx!.fillStyle = '#ffffff';
          ctx!.beginPath();
          ctx!.arc(logoCenterX, logoCenterY, logoRadius + 8, 0, 2 * Math.PI);
          ctx!.fill();

          ctx!.strokeStyle = '#e0e0e0';
          ctx!.lineWidth = 2;
          ctx!.stroke();

          ctx!.save();
          ctx!.beginPath();
          ctx!.arc(logoCenterX, logoCenterY, logoRadius, 0, 2 * Math.PI);
          ctx!.clip();
          ctx!.drawImage(logoImg, logoX + 4, logoY + 4, logoSize - 8, logoSize - 8);
          ctx!.restore();

          downloadCanvasAsPNG(
            canvas,
            `glific-flow-qr-${selectedKeyword.label.replace(/\s+/g, '-').toLowerCase()}.png`,
            'QR Code downloaded successfully!'
          );
        };

        logoImg.onerror = () => {
          downloadCanvasAsPNG(
            canvas,
            `glific-flow-qr-${selectedKeyword.label.replace(/\s+/g, '-').toLowerCase()}.png`,
            'QR Code downloaded successfully!'
          );
        };

        logoImg.src = logoSrc;
      };

      img.onerror = () => {
        setNotification('Failed to download QR code', 'warning');
      };

      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    } catch (error) {
      setNotification('Failed to download QR code', 'warning');
    }
  };

  useEffect(() => {
    setFlowLink(getFlowLink(selectedKeyword));
  }, [selectedKeyword, webChatAddress]);

  return (
    <Dialog fullWidth maxWidth="md" open={shareDialogKeywords.length > 0} onClose={() => handleClose()}>
      <div className={styles.Container}>
        <Typography data-testid="dialogHeading" className={styles.Heading} variant="h5">
          Share Responder Link
        </Typography>

        <div className={styles.Content}>
          <div className={styles.LinkSection}>
            {isWeb ? (
              <div>
                <Typography variant="subtitle1" className={styles.SectionTitle}>
                  Web chat
                </Typography>
                <span className={styles.BotNumber} data-testid="webChatAddress">
                  {webChatAddress}
                </span>
              </div>
            ) : (
              <div>
                <Typography variant="subtitle1" className={styles.SectionTitle}>
                  Bot Number
                </Typography>
                <span className={styles.BotNumber}>+{botNumber}</span>
              </div>
            )}
            <div className={styles.Section}>
              <Typography variant="subtitle1" className={styles.SectionTitle}>
                Keyword
              </Typography>
              {shareDialogKeywords.length > 1 ? (
                <Autocomplete
                  options={shareDialogKeywords}
                  value={selectedKeyword}
                  onChange={(_, newValue) => {
                    if (newValue) {
                      setSelectedKeyword(newValue);
                    }
                  }}
                  getOptionLabel={(option) => option.label}
                  renderOption={(props, option) => (
                    <li {...props} className={styles.KeywordOption}>
                      <Chip label={option.label} size="small" className={styles.KeywordChip} />
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Choose a keyword to trigger your flow"
                      variant="outlined"
                      className={styles.KeywordSelect}
                    />
                  )}
                  disableClearable
                />
              ) : (
                <div className={styles.Keyword}>{selectedKeyword.label}</div>
              )}
            </div>

            <div>
              <Typography variant="subtitle1" className={styles.SectionTitle}>
                Responder Link
              </Typography>
              <div className={styles.LinkCard}>
                <div data-testid="flowLink" className={styles.LinkText}>
                  {flowLink}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.QRSection}>
            <div className={styles.QRCard}>
              <div className={styles.QRContainer}>
                <QRCode
                  id="flow-qr-code"
                  size={200}
                  value={flowLink}
                  viewBox="0 0 256 256"
                  level="H"
                  fgColor="#000000"
                  bgColor="#ffffff"
                  className={styles.QRCode}
                />
                <div className={styles.QRLogo}>
                  <img src={logoSrc} alt="Logo" className={styles.LogoImage} />
                </div>
              </div>

              <Typography variant="caption" className={styles.QRCaption}>
                {isWeb
                  ? 'Scan to open the web chat and start the flow'
                  : 'Scan to open WhatsApp with the selected keyword'}
              </Typography>
            </div>
          </div>
        </div>

        <div className={styles.ButtonSection}>
          <Button
            data-testid="copyButton"
            variant="outlined"
            onClick={() => copyToClipboard(flowLink)}
            className={styles.CopyButton}
          >
            <ContentCopyIcon />
            Copy Responder link
          </Button>
          <Button
            data-testid="downloadButton"
            variant="contained"
            onClick={downloadQRCode}
            className={styles.DownloadButton}
          >
            <DownloadIcon />
            Download QR Code
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default ShareResponderLink;
