import React from 'react';
import { ReactTinyLink } from 'react-tiny-link';
import Linkify from 'react-linkify';

import { WhatsAppToJsx } from '../../../../common/RichEditor';
import styles from './MessagesWithLinks.module.css';

export interface MessagesWithLinksProps {
  message: any;
}

export const MessagesWithLinks: React.FC<MessagesWithLinksProps> = (
  props: MessagesWithLinksProps
) => {
  const { message } = props;
  let linkPreview = null;
  let messagebody: any = WhatsAppToJsx(message);
  const regexForLink = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi;

  // first element is the url, if the url is sent
  const linkMessage = regexForLink.exec(message);

  if (linkMessage) {
    linkPreview = (
      <div className={styles.LinkPreview}>
        <ReactTinyLink cardSize="small" showGraphic maxLine={2} minLine={1} url={linkMessage[0]} />
      </div>
    );
  }

  messagebody = (
    <Linkify
      componentDecorator={(decoratedHref, decoratedText, key) => (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={decoratedHref}
          key={key}
          data-testid="messageLink"
        >
          {decoratedText}
        </a>
      )}
    >
      {messagebody}
    </Linkify>
  );

  return (
    <>
      {linkPreview}
      {messagebody}
    </>
  );
};
