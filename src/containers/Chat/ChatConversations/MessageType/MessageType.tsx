import { ReactComponent as ImageIcon } from 'assets/images/icons/Image.svg';
import { ReactComponent as VideoIcon } from 'assets/images/icons/Video.svg';
import { ReactComponent as AudioIcon } from 'assets/images/icons/Audio.svg';
import { ReactComponent as DocumentIcon } from 'assets/images/icons/Document/Light.svg';
import { ReactComponent as StickerIcon } from 'assets/images/icons/Sticker/Light.svg';
import { ReactComponent as LocationIcon } from 'assets/images/icons/Location/Light.svg';
import { ReactComponent as ImageIconDark } from 'assets/images/icons/Image/Dark.svg';
import { ReactComponent as VideoIconDark } from 'assets/images/icons/Video/Dark.svg';
import { ReactComponent as AudioIconDark } from 'assets/images/icons/Audio/Dark.svg';
import { ReactComponent as DocumentIconDark } from 'assets/images/icons/Document/Dark.svg';
import { ReactComponent as StickerIconDark } from 'assets/images/icons/Sticker/Dark.svg';
import { ReactComponent as LocationIconDark } from 'assets/images/icons/Location/Dark.svg';

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
