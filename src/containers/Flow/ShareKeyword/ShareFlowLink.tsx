import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Autocomplete, Chip, Dialog, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import logoSrc from 'assets/images/logo/Logo.svg';
import { SHARE_FLOW_LINK } from 'common/constants';
import { setNotification } from 'common/notification';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { getUserSession } from 'services/AuthService';
import styles from './ShareFlowLink.module.css';
import { Button } from 'components/UI/Form/Button/Button';
import DownloadIcon from 'assets/images/icons/DownloadIcon.svg?react';

interface ShareFlowLinkProps {
  shareDialogKeywords: any[];
  setShareDialogKeywords: Function;
}

export const ShareFlowLink = ({ shareDialogKeywords, setShareDialogKeywords }: ShareFlowLinkProps) => {
  const [selectedKeyword, setSelectedKeyword] = useState(shareDialogKeywords[0]);
  const [flowLink, setFlowLink] = useState('');

  const organization = getUserSession('organization');
  const botNumber = organization?.contact?.phone;

  const getFlowLink = (keyword: { label: string; id: number }) =>
    `${SHARE_FLOW_LINK}${botNumber}?text=${keyword.label}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotification('Link copied to clipboard!');
    } catch (err) {
      setNotification('Failed to copy link', 'warning');
    }
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

          const pngFile = canvas.toDataURL('image/png', 1.0);
          const downloadLink = document.createElement('a');
          downloadLink.download = `glific-flow-qr-${selectedKeyword.label.replace(/\s+/g, '-').toLowerCase()}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();

          setNotification('QR Code with logo downloaded successfully!');
        };

        logoImg.onerror = () => {
          const pngFile = canvas.toDataURL('image/png', 1.0);
          const downloadLink = document.createElement('a');
          downloadLink.download = `glific-flow-qr-${selectedKeyword.label.replace(/\s+/g, '-').toLowerCase()}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();

          setNotification('QR Code downloaded successfully!');
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
  }, [selectedKeyword]);

  return (
    <Dialog
      fullWidth={true}
      maxWidth={'md'}
      open={shareDialogKeywords.length > 0}
      onClose={() => setShareDialogKeywords([])}
    >
      <div className={styles.Container}>
        <Typography className={styles.Heading} variant="h5">
          Share Link To a Flow
        </Typography>

        <div className={styles.Content}>
          <div className={styles.LinkSection}>
            <div>
              <Typography variant="subtitle1" className={styles.SectionTitle}>
                Bot Number
              </Typography>
              <span className={styles.BotNumber}>+ {botNumber}</span>
            </div>
            <div className={styles.Section}>
              <Typography variant="subtitle1" className={styles.SectionTitle}>
                Select Keyword
              </Typography>
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
            </div>

            <div>
              <Typography variant="subtitle1" className={styles.SectionTitle}>
                Flow Link
              </Typography>
              <div className={styles.LinkCard}>
                <div className={styles.LinkText}>{flowLink}</div>
                <Tooltip title="Copy link">
                  <IconButton onClick={() => copyToClipboard(flowLink)} className={styles.CopyIcon} size="small">
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
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
                Scan to open WhatsApp with the selected keyword
              </Typography>
            </div>
          </div>
        </div>

        <div className={styles.ButtonSection}>
          <Button variant="outlined" onClick={() => copyToClipboard(flowLink)} className={styles.CopyButton}>
            <ContentCopyIcon />
            Copy Flow Link
          </Button>
          <Button variant="contained" onClick={downloadQRCode} className={styles.DownloadButton}>
            <DownloadIcon />
            Download QR Code
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
