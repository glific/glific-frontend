import { useState, useEffect } from 'react';
import { Dialog, DialogContent, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface SessionData {
  last_login_time: string | null;
  is_trial: boolean;
  trial_expiration_date: string | null;
}

interface TrialVideoModalProps {
  sessionData: SessionData | null;
}

export const TrialVideoModal = ({ sessionData }: TrialVideoModalProps) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!sessionData) return;

    const videoShownKey = 'trial_video_shown';
    const alreadyShown = sessionStorage.getItem(videoShownKey);

    if (sessionData.last_login_time === null && sessionData.is_trial && !alreadyShown) {
      setShowModal(true);
      sessionStorage.setItem(videoShownKey, 'true');
    }
  }, [sessionData]);

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <Dialog
      open={showModal}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: '#fff',
          borderRadius: '12px',
          margin: '20px',
        },
      }}
    >
      <IconButton
        aria-label="close"
        onClick={handleClose}
        style={{
          position: 'absolute',
          right: 10,
          top: 10,
          color: '#666',
          zIndex: 10,
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent style={{ padding: 0, overflow: 'hidden' }}>
        <iframe
          src="https://www.canva.com/design/DAG4qx6Mn10/Es-HszV0JoAzqMV9eLM3rQ/view?embed"
          style={{
            width: '100%',
            height: '70vh',
            border: 'none',
            display: 'block',
          }}
          title="Trial Welcome"
          allow="fullscreen"
          allowFullScreen
        />
        <Button
          variant="contained"
          onClick={handleClose}
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#119656',
            color: 'white',
            padding: '10px 38px',
            fontSize: '21px',
            fontWeight: '700',
            textTransform: 'none',
            borderRadius: '3px',
            zIndex: 5,
            cursor: 'pointer',
            boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
            letterSpacing: '0.3px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0c6d3d';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0f8249';
          }}
        >
          Let's get Started
        </Button>
      </DialogContent>
    </Dialog>
  );
};
