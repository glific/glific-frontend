import React, { useState } from 'react';

import Viewer from 'react-viewer';
import ReactPlayer from 'react-player';
import GetAppIcon from '@material-ui/icons/GetApp';
import { Img } from 'react-image';

import styles from './ChatMessageType.module.css';
import { MessagesWithLinks } from '../../MessagesWithLinks/MessagesWithLinks';
import loadingImage from '../../../../../assets/images/loading.gif';
import FallbackImage from '../../../../../assets/images/imageError.png';
import VideoThumbnail from '../../../../../assets/images/videothumbnail.jpeg';
import DocumentThumbnail from '../../../../../assets/images/imagethumbnail.jpg';
import { ReactComponent as MapIcon } from '../../../../../assets/images/map.svg';

export interface ChatMessageTypeProps {
  type: string;
  media: any;
  insertedAt?: string;
  body: string;
  location: any;
}

export const ChatMessageType: React.SFC<ChatMessageTypeProps> = ({
  type,
  media,
  body,
  location,
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
          <div className={styles.Image} data-testid="imageMessage">
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
          <audio controls data-testid="audioMessage" controlsList="nodownload">
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
              className={styles.Image}
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
        <>
          <div
            data-testid="documentMessage"
            style={{ background: `url("${DocumentThumbnail}") no-repeat` }}
            className={styles.Document}
          />
          <a href={media.url} className={styles.DocumentText}>
            <GetAppIcon />
            {media.caption}
          </a>
        </>
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
