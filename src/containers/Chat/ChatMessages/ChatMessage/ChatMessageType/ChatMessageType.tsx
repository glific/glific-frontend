import React, { useState } from 'react';

import Viewer from 'react-viewer';
import ReactPlayer from 'react-player';
import { Img } from 'react-image';

import styles from './ChatMessageType.module.css';
import { MessagesWithLinks } from '../../MessagesWithLinks/MessagesWithLinks';
import loadingImage from '../../../../../assets/images/loading.gif';
import FallbackImage from '../../../../../assets/images/imageError.png';
import VideoThumbnail from '../../../../../assets/images/videothumbnail.jpeg';
import { ReactComponent as MapIcon } from '../../../../../assets/images/map.svg';
import { ReactComponent as DocumentIconDark } from '../../../../../assets/images/icons/Document/Dark.svg';
import { ReactComponent as DownloadIcon } from '../../../../../assets/images/icons/Download.svg';

export interface ChatMessageTypeProps {
  type: string;
  media: any;
  insertedAt?: string;
  body: string;
  location: any;
  isSimulatedMessage?: boolean;
}

export const ChatMessageType: React.SFC<ChatMessageTypeProps> = ({
  type,
  media,
  body,
  location,
  isSimulatedMessage,
}) => {
  const [showViewer, setShowViewer] = useState(false);

  let messageBody;
  // manage validation if there is no media
  if (type !== 'LOCATION' && !media) {
    return <MessagesWithLinks message={body} />;
  }

  switch (type) {
    case 'IMAGE':
      messageBody = (
        <>
          <div
            className={isSimulatedMessage ? styles.SimulatorImage : styles.Image}
            data-testid="imageMessage"
          >
            <Img
              src={media.url}
              onClick={() => setShowViewer(true)}
              loader={<img src={loadingImage} alt="loader" />}
              unloader={<img src={FallbackImage} alt="fallback" />}
            />
            <Viewer
              visible={showViewer}
              onClose={() => {
                setShowViewer(false);
              }}
              images={[{ src: media.url, alt: '' }]}
            />
          </div>
          <MessagesWithLinks message={media.caption} />
        </>
      );

      break;

    case 'STICKER':
      messageBody = (
        <>
          <img
            data-testid="stickerMessage"
            src={media.url}
            className={styles.Image}
            aria-hidden="true"
            alt="sticker"
          />
        </>
      );
      break;

    case 'AUDIO':
      messageBody = (
        <div>
          <audio
            controls
            data-testid="audioMessage"
            controlsList="nodownload"
            className={isSimulatedMessage ? styles.SimulatorAudio : styles.Audio}
          >
            <source src={media.url} type="audio/ogg" />
          </audio>
        </div>
      );
      break;

    case 'VIDEO':
      messageBody = (
        <div>
          <div className={styles.Image} data-testid="videoMessage">
            <ReactPlayer
              className={isSimulatedMessage ? styles.SimulatorVideo : styles.Video}
              url={media.url}
              controls
              light={VideoThumbnail}
              config={{ file: { attributes: { controlsList: 'nodownload' } } }}
            />
          </div>
          <MessagesWithLinks message={media.caption} />
        </div>
      );
      break;

    case 'DOCUMENT':
      messageBody = (
        <div data-testid="documentMessage" className={styles.Document}>
          <div>
            <DocumentIconDark />
            {media.caption}
          </div>
          <a
            href={media.url}
            className={styles.DocumentText}
            download={media.caption}
            target="_blank"
            rel="noreferrer"
          >
            <DownloadIcon className={styles.DownloadIcon} />
          </a>
        </div>
      );
      break;

    case 'LOCATION':
      messageBody = (
        <a
          href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
          target="_blank"
          rel="noreferrer"
          data-testid="locationMessage"
        >
          <MapIcon />
        </a>
      );
      break;

    default:
      messageBody = <MessagesWithLinks message={body} />;
  }

  return messageBody;
};

export default ChatMessageType;
