import React, { useCallback } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { IconButton } from '@material-ui/core';
import MicIcon from '@material-ui/icons/Mic';
import StopIcon from '@material-ui/icons/Stop';
import CancelIcon from '@material-ui/icons/Cancel';

import styles from './VoiceRecorder.module.css';

export interface VoiceRecorderProps {
  handleAudioRecording: any;
}

export const VoiceRecorder: React.SFC<VoiceRecorderProps> = (props) => {
  // function to save the recording to a file
  const saveRecording = useCallback(async (blobUrl: string, blob: Blob) => {
    const audiofile = new File([blob], 'audiofile.webm', { type: 'audio/webm' });
    props.handleAudioRecording(audiofile);
  }, []);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
  } = useReactMediaRecorder({
    audio: true,
    onStop: saveRecording,
  });

  // function to start recording
  const startCallback = () => {
    // let's clear previous recording
    clearBlobUrl();

    // start recording
    startRecording();
  };

  let audioPreview;

  if (mediaBlobUrl) {
    audioPreview = (
      <div className={styles.AudioPlayerSection}>
        <div className={styles.AudioPlayer}>
          <audio src={mediaBlobUrl} controls className={styles.AudioPlayer} />
        </div>
        <div className={styles.AudioPlayerClose}>
          <IconButton>
            <CancelIcon onClick={clearBlobUrl} />
          </IconButton>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.VoiceRecorder}>
      <IconButton className={styles.RecorderIcon}>
        {status !== 'recording' ? (
          <MicIcon onClick={startCallback} />
        ) : (
          <StopIcon onClick={stopRecording} />
        )}
      </IconButton>
      {audioPreview}
    </div>
  );
};

export default VoiceRecorder;
