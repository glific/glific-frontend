import React, { useState } from 'react';
import { DATE_FORMAT } from '../../../../../common/constants';
import moment from 'moment';
import Viewer from 'react-viewer';
import ReactPlayer from 'react-player';
import GetAppIcon from '@material-ui/icons/GetApp';
import { Tooltip } from '../../../../../components/UI/Tooltip/Tooltip';
import styles from './ChatMessageType.module.css';
import { MessagesWithLinks } from '../../MessagesWithLinks/MessagesWithLinks';
import VideoThumbnail from '../../../../../assets/images/videoThumbnail.jpeg';
import ImageThumbnail from '../../../../../assets/images/loading.gif';
import DocumentThumbnail from '../../../../../assets/images/imagethumbnail.jpg';

export interface ChatMessageTypeProps {
  type: string;
  media: any;
  insertedAt: string;
  body: string;
}

export const ChatMessageType: React.SFC<ChatMessageTypeProps> = ({
  type,
  media,
  insertedAt,
  body,
}) => {
  const [showViewer, setShowViewer] = useState(false);
  let messageBody;

  switch (type) {
    case 'IMAGE':
      messageBody = (
        <>
          <div
            data-testid="imageMessage"
            style={{
              background: `url("${media.url}"), url('${ImageThumbnail}') no-repeat`,
            }}
            onClick={() => setShowViewer(true)}
            className={styles.Image}
          ></div>
          <Viewer
            visible={showViewer}
            onClose={() => {
              setShowViewer(false);
            }}
            images={[{ src: media.url, alt: '' }]}
          />
          <br />
          <MessagesWithLinks message={media.caption} />
        </>
      );
      break;

    case 'AUDIO':
      messageBody = (
        <audio controls data-testid="audioMessage">
          <source src={media.url} type="audio/ogg"></source>
        </audio>
      );
      break;

    case 'VIDEO':
      messageBody = (
        <div className={styles.Image} data-testid="videoMessage">
          <ReactPlayer
            className={styles.Image}
            url={media.url}
            controls={true}
            light={VideoThumbnail}
          />
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
          ></div>
          <a href={media.url} className={styles.DocumentText}>
            <GetAppIcon />
            {media.caption}
          </a>
        </>
      );
      break;

    default:
      messageBody = (
        <Tooltip title={moment(insertedAt).format(DATE_FORMAT)} placement="right">
          <MessagesWithLinks message={body} />
        </Tooltip>
      );
  }

  return messageBody;
};

export default ChatMessageType;
