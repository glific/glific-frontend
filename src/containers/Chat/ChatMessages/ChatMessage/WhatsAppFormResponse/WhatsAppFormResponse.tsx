import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import styles from './WhatsAppFormResponse.module.css';
import { DocumentScannerSharp } from '@mui/icons-material';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';

interface WhatsAppFormResponseProps {
  waFormResponse: any;
  isSender: boolean;
}

export const WhatsAppFormResponse: React.FC<WhatsAppFormResponseProps> = ({ waFormResponse, isSender }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const formatResponse = (rawResponse: any) => {
    if (!rawResponse) return {};
    const parsedResponse = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;

    const screenData: { [key: string]: { [key: string]: string } } = {};

    Object.entries(parsedResponse).forEach(([key, value]) => {
      if (key === 'flow_token') return; // Skip flow_token

      const parts = key.split('_');
      if (parts.length >= 3 && parts[0] === 'screen') {
        const screenNumber = parseInt(parts[1]);
        const questionName = parts
          .slice(2, -1) // Take everything between screen number and last part (which is answer index)
          .join(' ')
          .replace(/([A-Z])/g, ' $1')
          .trim();

        const rating = value as string;
        const [ratingValue, ratingText] = rating.split('_');
        const readableRating = `${ratingText} (${parseInt(ratingValue) + 1}/5)`;

        // Group by screen
        const screenKey = `Screen ${screenNumber + 1}`; // Convert 0-indexed to 1-indexed
        if (!screenData[screenKey]) {
          screenData[screenKey] = {};
        }
        screenData[screenKey][questionName] = readableRating;
      }
    });

    return screenData;
  };

  const formattedResponse = formatResponse(waFormResponse?.rawResponse);

  const renderStars = (rating: string) => {
    const match = rating.match(/\((\d+)\/5\)/);
    if (!match) return null;

    const starCount = parseInt(match[1]);
    return (
      <Box display="flex" alignItems="center" gap={0.5}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} style={{ color: star <= starCount ? '#ffd700' : '#e0e0e0' }}>
            ★
          </span>
        ))}
        <Typography variant="body2" sx={{ ml: 1 }}>
          {rating}
        </Typography>
      </Box>
    );
  };

  console.log(waFormResponse ? JSON.parse(waFormResponse?.rawResponse) : {});
  console.log(formattedResponse);

  return (
    <>
      <div
        className={`${styles.formResponseContainer} ${isSender ? styles.sender : styles.receiver}`}
        onClick={handleOpen}
      >
        <DocumentScannerSharp className={styles.icon} />
        <div className={styles.content}>
          <Typography variant="body2" className={styles.title}>
            View Response
          </Typography>
          <Typography variant="caption" className={styles.subtitle}>
            Response recieved
          </Typography>
        </div>
      </div>

      <DialogBox
        open={open}
        title="WhatsApp Form Response"
        handleCancel={handleClose}
        skipCancel
        handleOk={handleClose}
        buttonOk="Close"
      >
        {Object.entries(formattedResponse).map(([screenName, questions]) => (
          <Box key={screenName} mb={4}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#119656' }}>
              {screenName}
            </Typography>

            {Object.entries(questions).map(([question, answer], questionIndex) => (
              <Box key={questionIndex} mb={2} ml={2}>
                <Typography variant="body1" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                  {question}
                </Typography>
                {renderStars(answer as string)}
              </Box>
            ))}
          </Box>
        ))}
      </DialogBox>

      {/* <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6">Your response</Typography>
        </DialogTitle>
        <DialogContent>
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog> */}
    </>
  );
};
