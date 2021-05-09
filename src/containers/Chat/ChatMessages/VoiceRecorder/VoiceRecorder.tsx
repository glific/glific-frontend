import React, { useCallback, useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { IconButton } from '@material-ui/core';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import StopIcon from '@material-ui/icons/Stop';
import CancelIcon from '@material-ui/icons/Cancel';
import { useTranslation } from 'react-i18next';

import styles from './VoiceRecorder.module.css';

export interface VoiceRecorderProps {
  handleAudioRecording: any;
  clearAudio: any;
  uploading?: boolean;
}

export const VoiceRecorder: React.SFC<VoiceRecorderProps> = (props) => {
  const { handleAudioRecording, clearAudio, uploading } = props;
  const [showRecordCounter, setShowRecordCounter] = useState(false);
  const { t } = useTranslation();

  // function to save the recording to a file
  const saveRecording = useCallback(async (blobUrl: string, blob: Blob) => {
    // set the blob for processing
    handleAudioRecording(blob);
  }, []);

  const {
    status,
    error,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
  } = useReactMediaRecorder({
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
          <IconButton>
            <CancelIcon onClick={cancelCallback} data-testid="cancelIcon" />
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
    showRecordingOption = <MicOffIcon data-testid="micOffIcon" />;
  } else if (status !== 'recording') {
    showRecordingOption = <MicIcon onClick={startCallback} data-testid="micIcon" />;
  } else {
    showRecordingOption = <StopIcon onClick={stopCallback} data-testid="stopIcon" />;
  }

  return (
    <div className={styles.VoiceRecorder}>
      <IconButton className={styles.RecorderIcon} data-testid="recorder">
        {showRecordingOption}
      </IconButton>
      {audioPreview}
      {recordIndicator}
      {uploadStatus}
    </div>
  );
};

export default VoiceRecorder;
