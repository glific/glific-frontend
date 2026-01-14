import { useState, useEffect } from 'react';
import { Dialog, DialogContent, IconButton, Button, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import styles from './TrialVideoModal.module.css';

interface SessionData {
  last_login_time: string | null;
  is_trial: boolean;
  trial_expiration_date: string | null;
}

interface TrialVideoModalProps {
  sessionData: SessionData | null;
}

const TrialVideoModal = ({ sessionData }: TrialVideoModalProps) => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionData) return;

    const alreadyShown = sessionStorage.getItem('trial_video_shown');

    if (!alreadyShown && sessionData.is_trial && sessionData.last_login_time === null) {
      setShowModal(true);
      sessionStorage.setItem('trial_video_shown', 'true');
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
      className={styles.dialog}
      aria-labelledby="trial-welcome-title"
      aria-describedby="trial-welcome-description"
    >
      <IconButton aria-label="Close trial welcome video" onClick={handleClose} className={styles.closeButton}>
        <CloseIcon />
      </IconButton>
      <DialogContent className={styles.dialogContent}>
        {isLoading && (
          <div className={styles.loadingContainer}>
            <CircularProgress />
          </div>
        )}
        <iframe
          src="https://www.canva.com/design/DAG4qx6Mn10/Es-HszV0JoAzqMV9eLM3rQ/view?embed"
          className={styles.iframe}
          title="Trial Welcome"
          allow="fullscreen"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
        <Button variant="contained" onClick={handleClose} className={styles.startButton}>
          Let&apos;s get Started
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default TrialVideoModal;
