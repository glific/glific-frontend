import { useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import { Button, CircularProgress, IconButton, MenuItem, Select, TextField, Tooltip } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';

import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { setNotification } from 'common/notification';
import { UPLOAD_MEDIA } from 'graphql/mutations/Chat';
import setLogs from 'config/logs';
import styles from './SimulatorComposer.module.css';

/**
 * The shared simulator composer — text, a real attachment, and a location (contract §13.6).
 *
 * Both preview tabs use this. Media goes through the staff `uploadMedia` mutation, which returns
 * a hosted URL that both the Gupshup callback payload and `SimulatorWebMessageInput.url` accept —
 * replacing the five hardcoded `SAMPLE_MEDIA_FOR_SIMULATOR` URLs the WhatsApp paperclip used to
 * send. Location offers manual lat/lng as well as `navigator.geolocation`, which is unreliable
 * behind a VPN and unavailable over plain http.
 */
export interface SimulatorMedia {
  type: string;
  url: string;
  caption: string;
  contentType: string;
}

export interface SimulatorLocation {
  latitude: number;
  longitude: number;
}

export interface SimulatorComposerProps {
  disabled?: boolean;
  /** `web` drops the phone-chrome styling for the browser-widget shell. */
  variant?: 'whatsapp' | 'web';
  /** The web channel has no STICKER in the frozen `MessageTypeEnum` (§13.2). */
  mediaTypes?: string[];
  onSendText: (text: string) => void;
  onSendMedia: (media: SimulatorMedia) => void;
  onSendLocation: (location: SimulatorLocation) => void;
}

const DEFAULT_MEDIA_TYPES = ['IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT'];

const ACCEPT: Record<string, string> = {
  IMAGE: 'image/*',
  AUDIO: 'audio/*',
  VIDEO: 'video/*',
  DOCUMENT: '*/*',
  STICKER: 'image/webp',
};

export const SimulatorComposer = ({
  disabled = false,
  variant = 'whatsapp',
  mediaTypes = DEFAULT_MEDIA_TYPES,
  onSendText,
  onSendMedia,
  onSendLocation,
}: SimulatorComposerProps) => {
  const [text, setText] = useState('');
  const [mediaType, setMediaType] = useState(mediaTypes[0]);
  const [uploading, setUploading] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [caption, setCaption] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [uploadMedia] = useMutation(UPLOAD_MEDIA);

  const sendText = () => {
    if (disabled || !text.trim()) return;
    onSendText(text.trim());
    setText('');
  };

  const handleFile = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.slice((Math.max(0, file.name.lastIndexOf('.')) || Infinity) + 1);
    setUploading(true);

    try {
      const { data } = await uploadMedia({ variables: { media: file, extension } });
      if (data?.uploadMedia) {
        onSendMedia({
          type: mediaType,
          url: data.uploadMedia,
          caption: caption.trim(),
          contentType: file.type || '',
        });
        setShowAttach(false);
        setCaption('');
      }
    } catch (error) {
      setLogs('simulator uploadMedia failed', 'error', true);
      setLogs(error, 'error', true);
      setNotification('An error occured while uploading the file', 'warning');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const useBrowserLocation = () => {
    if (!navigator.geolocation) {
      setNotification('This browser cannot report a location. Enter one manually.', 'warning');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude));
        setLongitude(String(position.coords.longitude));
      },
      () => setNotification('Could not read your location. Enter one manually.', 'warning')
    );
  };

  const sendLocation = () => {
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!latitude.trim() || !longitude.trim() || Number.isNaN(lat) || Number.isNaN(lng)) {
      setNotification('Enter a valid latitude and longitude', 'warning');
      return;
    }
    onSendLocation({ latitude: lat, longitude: lng });
    setShowLocation(false);
  };

  const attachDialog = showAttach && (
    <DialogBox
      title="Send an attachment"
      buttonOk="Choose file"
      handleOk={() => fileRef.current?.click()}
      handleCancel={() => setShowAttach(false)}
      alwaysOntop
      buttonOkLoading={uploading}
      disableOk={uploading}
    >
      <div className={styles.Dialog} data-testid="simulatorAttachDialog">
        <Select
          size="small"
          fullWidth
          value={mediaType}
          data-testid="simulatorMediaType"
          inputProps={{ 'aria-label': 'Media type' }}
          onChange={(event) => setMediaType(event.target.value)}
        >
          {mediaTypes.map((type: string) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
        <TextField
          size="small"
          fullWidth
          label="Caption"
          value={caption}
          data-testid="simulatorCaption"
          onChange={(event) => setCaption(event.target.value)}
        />
        {uploading && <CircularProgress size={20} data-testid="simulatorUploading" />}
        <input
          ref={fileRef}
          type="file"
          hidden
          accept={ACCEPT[mediaType] || '*/*'}
          data-testid="simulatorFileInput"
          onChange={handleFile}
        />
      </div>
    </DialogBox>
  );

  const locationDialog = showLocation && (
    <DialogBox
      title="Send a location"
      buttonOk="Send"
      handleOk={sendLocation}
      handleCancel={() => setShowLocation(false)}
      alwaysOntop
    >
      <div className={styles.Dialog} data-testid="simulatorLocationDialog">
        <TextField
          size="small"
          fullWidth
          label="Latitude"
          value={latitude}
          data-testid="simulatorLatitude"
          onChange={(event) => setLatitude(event.target.value)}
        />
        <TextField
          size="small"
          fullWidth
          label="Longitude"
          value={longitude}
          data-testid="simulatorLongitude"
          onChange={(event) => setLongitude(event.target.value)}
        />
        <Button variant="outlined" size="small" data-testid="simulatorUseMyLocation" onClick={useBrowserLocation}>
          Use my location
        </Button>
      </div>
    </DialogBox>
  );

  return (
    <div className={`${styles.Composer} ${variant === 'web' ? styles.Web : styles.Whatsapp}`} data-testid="composer">
      <input
        type="text"
        className={styles.Input}
        data-testid="composerInput"
        placeholder="Type a message"
        value={text}
        disabled={disabled}
        onChange={(event) => setText(event.target.value)}
        onKeyPress={(event: any) => {
          if (event.key === 'Enter') sendText();
        }}
      />
      <Tooltip title="Attach a file">
        <span>
          <IconButton size="small" disabled={disabled} data-testid="composerAttach" onClick={() => setShowAttach(true)}>
            <AttachFileIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Send a location">
        <span>
          <IconButton
            size="small"
            disabled={disabled}
            data-testid="composerLocation"
            onClick={() => setShowLocation(true)}
          >
            <LocationOnIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Send">
        <span>
          <IconButton size="small" disabled={disabled} data-testid="composerSend" onClick={sendText}>
            <SendIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      {attachDialog}
      {locationDialog}
    </div>
  );
};

export default SimulatorComposer;
