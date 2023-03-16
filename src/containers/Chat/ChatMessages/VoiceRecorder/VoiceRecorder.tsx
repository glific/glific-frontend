import { useCallback, useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { IconButton } from '@mui/material';
import MicOffIcon from '@mui/icons-material/MicOff';
import StopIcon from '@mui/icons-material/Stop';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTranslation } from 'react-i18next';
import { ReactComponent as MicIcon } from '../../../../assets/images/icons/Mic/Inactive.svg';
import { ReactComponent as MicActiveIcon } from '../../../../assets/images/icons/Mic/Active.svg';

import styles from './VoiceRecorder.module.css';

export interface VoiceRecorderProps {
  handleAudioRecording: any;
  clearAudio: any;
  uploading?: boolean;
  isMicActive?: boolean;
}

export const VoiceRecorder = ({
  handleAudioRecording,
  clearAudio,
  uploading,
  isMicActive,
}: VoiceRecorderProps) => {
  const [showRecordCounter, setShowRecordCounter] = useState(false);

  const { t } = useTranslation();
  // function to save the recording to a file
  const saveRecording = useCallback(async (blobUrl: string, blob: Blob) => {
    // set the blob for processing
    handleAudioRecording(blob);
  }, []);

  const { status, error, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      blobPropertyBag: {
        type: 'audio/mpeg',
      },
      onStop: saveRecording,
    });

  // function to start recording
  const startCallback = () => {
    // let's clear previous recording
    clearBlobUrl();
    // start recording
    startRecording();

    // show indicator
    setShowRecordCounter(true);
  };

  // function to stop recording
  const stopCallback = () => {
    // stop recording
    stopRecording();
    // show indicator
    setShowRecordCounter(false);
  };

  const cancelCallback = () => {
    // let's clear previous recording
    clearBlobUrl();

    handleAudioRecording('');
  };

  let audioPreview;

  if (mediaBlobUrl && !clearAudio && !uploading) {
    audioPreview = (
      <div className={styles.AudioPlayerSection}>
        <div className={styles.AudioPlayer}>
          <audio src={mediaBlobUrl} controls className={styles.AudioPlayer} />
        </div>
        <div className={styles.AudioPlayerClose}>
          <IconButton onClick={cancelCallback}>
            <CancelIcon data-testid="cancelIcon" />
          </IconButton>
        </div>
      </div>
    );
  }

  let recordIndicator;
  if (showRecordCounter) {
    recordIndicator = (
      <div className={styles.AudioPlayerSection}>
        <div className={styles.Recording} />
        <div className={styles.RecordingStatus}>{status}</div>
      </div>
    );
  }

  let uploadStatus;
  if (uploading) {
    uploadStatus = (
      <div className={styles.AudioPlayerSection}>
        <div className={styles.RecordingStatus}>{t('Sending')}</div>
      </div>
    );
  }

  let showRecordingOption;
  if (error === 'permission_denied') {
    showRecordingOption = (
      <IconButton className={styles.RecorderIcon} data-testid="recorder">
        <MicOffIcon data-testid="micOffIcon" />
      </IconButton>
    );
  } else if (status !== 'recording') {
    showRecordingOption = (
      <IconButton className={styles.RecorderIcon} onClick={startCallback} data-testid="recorder">
        {isMicActive ? (
          <MicActiveIcon data-testid="micIcon" className={styles.MicIcon} />
        ) : (
          <MicIcon data-testid="micIcon" className={styles.MicIcon} />
        )}
      </IconButton>
    );
  } else {
    showRecordingOption = (
      <IconButton className={styles.RecorderIcon} onClick={stopCallback} data-testid="recorder">
        <StopIcon data-testid="stopIcon" />
      </IconButton>
    );
  }

  return (
    <div className={styles.VoiceRecorder}>
      {audioPreview}
      {recordIndicator}
      {uploadStatus}
      {showRecordingOption}
    </div>
  );
};

export default VoiceRecorder;
