import ImageIcon from 'assets/images/icons/Image.svg?react';
import VideoIcon from 'assets/images/icons/Video.svg?react';
import AudioIcon from 'assets/images/icons/Audio.svg?react';
import DocumentIcon from 'assets/images/icons/Document/Light.svg?react';
import StickerIcon from 'assets/images/icons/Sticker/Light.svg?react';
import LocationIcon from 'assets/images/icons/Location/Light.svg?react';
import ImageIconDark from 'assets/images/icons/Image/Dark.svg?react';
import VideoIconDark from 'assets/images/icons/Video/Dark.svg?react';
import AudioIconDark from 'assets/images/icons/Audio/Dark.svg?react';
import DocumentIconDark from 'assets/images/icons/Document/Dark.svg?react';
import StickerIconDark from 'assets/images/icons/Sticker/Dark.svg?react';
import LocationIconDark from 'assets/images/icons/Location/Dark.svg?react';

import styles from './MessageType.module.css';

export interface MessageTypeProps {
  type: string;
  body?: string;
  color?: 'dark' | 'light';
}

const lightIcons: any = {
  IMAGE: <ImageIcon />,
  VIDEO: <VideoIcon />,
  AUDIO: <AudioIcon />,
  DOCUMENT: <DocumentIcon />,
  STICKER: <StickerIcon />,
  LOCATION: <LocationIcon />,
};

const darkIcons: any = {
  IMAGE: <ImageIconDark />,
  VIDEO: <VideoIconDark />,
  AUDIO: <AudioIconDark />,
  DOCUMENT: <DocumentIconDark />,
  STICKER: <StickerIconDark />,
  LOCATION: <LocationIconDark />,
};

export const MessageType = ({ type, body = '', color = 'light' }: MessageTypeProps) => {
  const isLight = color === 'light';

  const message: any = {
    TEXT: body,
    IMAGE: 'Image',
    VIDEO: 'Video',
    AUDIO: 'Audio',
    DOCUMENT: 'Document',
    STICKER: 'Sticker',
    LOCATION: 'Location',
    QUICK_REPLY: 'Quick Reply',
    LIST: 'List',
    LOCATION_REQUEST_MESSAGE: 'Location Request',
  };

  const option = (
    <>
      {isLight ? lightIcons[type] : darkIcons[type]}
      {message[type] ? message[type] : type}
    </>
  );

  return (
    <span
      className={`${styles.Message} ${isLight ? styles.Light : styles.Dark}`}
      data-testid="messageType"
    >
      {option}
    </span>
  );
};
