import React from 'react';
import { ReactTinyLink } from 'react-tiny-link';
import { WhatsAppToJsx } from '../../../../common/RichEditor';
import Linkify from 'react-linkify';
import styles from './MessagesWithLinks.module.css';

export interface MessagesWithLinksProps {
  message: any;
}

export const MessagesWithLinks: React.FC<MessagesWithLinksProps> = (
  props: MessagesWithLinksProps
) => {
  let linkPreview = null;
  let messagebody = WhatsAppToJsx(props.message);
  let array;
  const regexForLink = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
  if ((array = regexForLink.exec(props.message)) != null) {
    linkPreview = (
      <div className={styles.LinkPreview}>
        <ReactTinyLink cardSize="small" showGraphic={true} maxLine={2} minLine={1} url={array[0]} />
      </div>
    );
  }

  messagebody = (
    <Linkify
      componentDecorator={(decoratedHref, decoratedText, key) => {
        return (
          <a target="_blank" href={decoratedHref} key={key} data-testid="messageLink">
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
