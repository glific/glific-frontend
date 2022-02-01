import React from 'react';

import { ReactComponent as ImageIcon } from 'assets/images/icons/Image.svg';
import { ReactComponent as VideoIcon } from 'assets/images/icons/Video.svg';
import { ReactComponent as AudioIcon } from 'assets/images/icons/Audio.svg';
import { ReactComponent as DocumentIcon } from 'assets/images/icons/Document/Light.svg';
import { ReactComponent as StickerIcon } from 'assets/images/icons/Sticker/Light.svg';
import { ReactComponent as ImageIconDark } from 'assets/images/icons/Image/Dark.svg';
import { ReactComponent as VideoIconDark } from 'assets/images/icons/Video/Dark.svg';
import { ReactComponent as AudioIconDark } from 'assets/images/icons/Audio/Dark.svg';
import { ReactComponent as DocumentIconDark } from 'assets/images/icons/Document/Dark.svg';
import { ReactComponent as StickerIconDark } from 'assets/images/icons/Sticker/Dark.svg';
import styles from './MessageType.module.css';

export interface MessageTypeProps {
  type: string;
  body?: string;
  color?: 'dark' | 'light';
  compact?: boolean;
}

export const MessageType: React.FC<MessageTypeProps> = ({
  type,
  body = '',
  color = 'light',
  compact = false,
}: MessageTypeProps) => {
  const isLight = color === 'light';

  let message;
  switch (type) {
    case 'TEXT':
      message = body;
      if (compact && message.length > 40) {
        message = message.slice(0, 40).concat('...');
      }
      break;
    case 'IMAGE':
      message = (
        <>
          {isLight ? <ImageIcon /> : <ImageIconDark />}
          Image
        </>
      );
      break;
    case 'DOCUMENT':
      message = (
        <>
          {isLight ? <DocumentIcon /> : <DocumentIconDark />}
          Document
        </>
      );
      break;
    case 'STICKER':
      message = (
        <>
          {isLight ? <StickerIcon /> : <StickerIconDark />}
          Sticker
        </>
      );
      break;
    case 'VIDEO':
      message = (
        <>
          {isLight ? <VideoIcon /> : <VideoIconDark />}
          Video
        </>
      );
      break;
    case 'AUDIO':
      message = (
        <>
          {isLight ? <AudioIcon /> : <AudioIconDark />}
          Audio
        </>
      );
      break;
    case 'QUICK_REPLY':
      message = 'Quick Reply';
      break;
    case 'LIST':
      message = 'List';
      break;
    default:
      message = type;
  }

  return (
    <span
      className={`${styles.Message} ${isLight ? styles.Light : styles.Dark}`}
      data-testid="messageType"
    >
      {message}
    </span>
  );
};
