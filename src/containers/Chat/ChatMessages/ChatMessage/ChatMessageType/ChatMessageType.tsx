import React, { useState, useEffect } from 'react';

import Viewer from 'react-viewer';
import ReactPlayer from 'react-player';
import GetAppIcon from '@material-ui/icons/GetApp';

import styles from './ChatMessageType.module.css';
import { MessagesWithLinks } from '../../MessagesWithLinks/MessagesWithLinks';
import VideoThumbnail from '../../../../../assets/images/videothumbnail.jpeg';
import ImageThumbnail from '../../../../../assets/images/loading.gif';
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
  const [imageUrl, setImageUrl] = useState(ImageThumbnail);
  useEffect(() => {
    if (type === 'IMAGE') {
      const image: any = document.querySelector(`#image${media.id}`);
      if (image) {
        image.onload = () => {
          setImageUrl('');
        };
      }
    }
  }, []);
  let messageBody;
  // manage validation if there is no media
  if (type !== 'LOCATION' && !media) {
    return <MessagesWithLinks message={body} />;
  }

  switch (type) {
    case 'IMAGE':
      messageBody = (
        <div
          className={styles.Image}
          style={{
            background: `transparent url('${imageUrl}') center no-repeat`,
          }}
        >
          <img
            alt="img"
            src={media.url}
            id={`image${media.id}`}
            data-testid="imageMessage"
            onClick={() => setShowViewer(true)}
            aria-hidden="true"
          />

          <Viewer
            visible={showViewer}
            onClose={() => {
              setShowViewer(false);
            }}
            images={[{ src: media.url, alt: '' }]}
          />
          <MessagesWithLinks message={media.caption} />
        </div>
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
