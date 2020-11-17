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
  let messagebody = WhatsAppToJsx(message);
  let array: any;
  const regexForLink = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi;
  if (regexForLink.exec(message) != null) {
    array = regexForLink.exec(message);
    linkPreview = (
      <div className={styles.LinkPreview}>
        <ReactTinyLink cardSize="small" showGraphic maxLine={2} minLine={1} url={array[0]} />
      </div>
    );
  }

  messagebody = (
    <Linkify
      componentDecorator={(decoratedHref, decoratedText, key) => {
        return (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={decoratedHref}
            key={key}
            data-testid="messageLink"
          >
            {decoratedText}
          </a>
        );
      }}
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
