import React, { useEffect, useState } from 'react';
import MicRecorder from 'mic-recorder-to-mp3';
import { IconButton } from '@material-ui/core';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';

import styles from './VoiceRecorder.module.css';

export interface VoiceRecorderProps {}

export const VoiceRecorder: React.SFC<VoiceRecorderProps> = () => {
  const [recording, setRecording] = useState(false);
  const [blobURL, setBlobURL] = useState('');
  const [blocked, setBlocked] = useState(false);

  const recorder = new MicRecorder({ bitRate: 128 });

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        console.log('Permission Granted');
        setBlocked(false);
      })
      .catch(() => {
        console.log('Permission Denied');
        setBlocked(true);
      });
  }, []);

  const startRecording = () => {
    if (blocked) {
      console.log('Permission Denied');
    } else {
      recorder
        .start()
        .then(() => {
          setRecording(true);
        })
        .catch((e: any) => console.error(e));
    }
  };

  const stopRecording = () => {
    recorder
      .stop()
      .getMp3()
      .then(([buffer, blob]: any) => {
        console.log(buffer, blob);
        const file = new File(buffer, 'music.mp3', {
          type: blob.type,
          lastModified: Date.now(),
        });

        const audioFileURL = URL.createObjectURL(file);

        console.log(audioFileURL);
        setRecording(false);
        setBlobURL(audioFileURL);
      })
      .catch((e: any) => {
        console.error(e);
      });
  };

  return (
    <div>
      <IconButton className={styles.RecorderIcon}>
        {!recording ? <MicIcon onClick={startRecording} /> : <MicOffIcon onClick={stopRecording} />}
      </IconButton>
      {blobURL ? <audio src={blobURL} controls /> : ''}
    </div>
  );
};

export default VoiceRecorder;
