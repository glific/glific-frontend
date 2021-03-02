import React, { useState, useEffect, useRef } from 'react';

import Viewer from 'react-viewer';
import ReactPlayer from 'react-player';
import GetAppIcon from '@material-ui/icons/GetApp';

import styles from './ChatMessageType.module.css';
import { MessagesWithLinks } from '../../MessagesWithLinks/MessagesWithLinks';
import VideoThumbnail from '../../../../../assets/images/videothumbnail.jpeg';
import ImageThumbnail from '../../../../../assets/images/loading.gif';
import NotLoadedThumbnail from '../../../../../assets/images/notloaded.webp';
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
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState(type === 'IMAGE' ? media.url : '');
  const ref = useRef(null);

  useEffect(() => {
    if (ref && ref.current) {
      const image: any = ref.current;
      image.onload = () => {
        setLoading(false);
      };
      image.onerror = () => {
        setImageUrl(NotLoadedThumbnail);
      };
    }
  }, [ref, type]);
  let messageBody;
  // manage validation if there is no media
  if (type !== 'LOCATION' && !media) {
    return <MessagesWithLinks message={body} />;
  }

  switch (type) {
    case 'IMAGE':
      messageBody = (
        <>
          <div className={styles.Image}>
            {loading ? <img alt="img" src={ImageThumbnail} /> : null}
            <img
              className={loading ? styles.ImageLoading : ''}
              alt="img"
              src={imageUrl}
              ref={ref}
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
