import { Typography } from '@mui/material';

import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { useEffect, useState } from 'react';
import styles from './WhatsAppFormResponse.module.css';

interface WhatsAppFormResponseProps {
  rawResponse: string;
}

export const WhatsAppFormResponse = ({ rawResponse }: WhatsAppFormResponseProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [parsedResponse, setParsedResponse] = useState<any>({});

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (rawResponse) {
      try {
        const response = JSON.parse(rawResponse);
        setParsedResponse(response);
      } catch (error) {
        console.error('Error parsing WhatsApp form response:', error);
        setParsedResponse({ error: 'Invalid response format' });
      }
    }
  }, [rawResponse]);

  return (
    <>
      <div className={styles.FormResponseContainer}>
        <div onClick={handleOpen} className={styles.Content}>
          <Typography variant="body2" className={styles.Title}>
            View Response
          </Typography>
          <Typography variant="caption" className={styles.Subtitle}>
            Response received
          </Typography>
        </div>
      </div>
      {open && (
        <DialogBox
          open={open}
          title="WhatsApp Form Response"
          handleCancel={handleClose}
          skipCancel
          handleOk={handleClose}
          buttonOk="Close"
        >
          {Object.keys(parsedResponse).length > 0 ? (
            <>
              {Object.entries(parsedResponse).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '8px' }}>
                  <Typography variant="subtitle2" style={{ fontWeight: 'bold' }}>
                    {key}:
                  </Typography>
                  <Typography variant="body2">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </Typography>
                </div>
              ))}
            </>
          ) : (
            <Typography variant="body2">No response data available.</Typography>
          )}
        </DialogBox>
      )}
    </>
  );
};
