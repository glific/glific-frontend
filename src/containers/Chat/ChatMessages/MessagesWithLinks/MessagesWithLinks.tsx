import React from 'react';
import { ReactTinyLink } from 'react-tiny-link';

import { WhatsAppToJsx } from '../../../../common/RichEditor';
import styles from './MessagesWithLinks.module.css';
import { CORS_PROXY_URL } from '../../../../config';

export interface MessagesWithLinksProps {
  message: any;
  showPreview?: boolean;
}

export const MessagesWithLinks: React.FC<MessagesWithLinksProps> = (
  props: MessagesWithLinksProps
) => {
  const { message, showPreview = true } = props;
  let linkPreview = null;
  const messagebody: any = WhatsAppToJsx(message);
  const regexForLink =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/gi;

  // first element is the url, if the url is sent
  const linkMessage = regexForLink.exec(message);
  if (linkMessage) {
    linkPreview = (
      <div className={styles.LinkPreview}>
        <ReactTinyLink
          cardSize="small"
          showGraphic
          maxLine={2}
          minLine={1}
          url={linkMessage[0]}
          proxyUrl={CORS_PROXY_URL}
        />
      </div>
    );
  }

  return (
    <>
      {showPreview && linkPreview}
      {messagebody}
    </>
  );
};
