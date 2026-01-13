import { useState, useEffect } from 'react';
import { Dialog, DialogContent, IconButton, Button } from '@mui/material';
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
    <Dialog open={showModal} onClose={handleClose} maxWidth="md" fullWidth className={styles.dialog}>
      <IconButton aria-label="close" onClick={handleClose} className={styles.closeButton}>
        <CloseIcon />
      </IconButton>
      <DialogContent className={styles.dialogContent}>
        <iframe
          src="https://www.canva.com/design/DAG4qx6Mn10/Es-HszV0JoAzqMV9eLM3rQ/view?embed"
          className={styles.iframe}
          title="Trial Welcome"
          allow="fullscreen"
          allowFullScreen
        />
        <Button variant="contained" onClick={handleClose} className={styles.startButton}>
          Let&apos;s get Started
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default TrialVideoModal;
