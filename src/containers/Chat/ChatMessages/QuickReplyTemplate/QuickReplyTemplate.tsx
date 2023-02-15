import React from 'react';
import { Button } from '@material-ui/core';
import { v4 as uuidv4 } from 'uuid';

import styles from './QuickReplyTemplate.module.css';
import { ChatMessageType } from '../ChatMessage/ChatMessageType/ChatMessageType';
import { MessagesWithLinks } from '../MessagesWithLinks/MessagesWithLinks';

interface Content {
  type: string;
  url?: string;
  header?: string;
  text?: string;
  filename?: string;
  caption?: string;
}

interface ButtonOption {
  type: string;
  title: string;
  postbackText: string | null;
}

export interface QuickReplyTemplateProps {
  content: Content;
  options: Array<ButtonOption>;
  disabled?: boolean;
  onQuickReplyClick: any;
  bspMessageId?: string;
  isSimulator: boolean;
  showHeader?: boolean;
}

export const QuickReplyTemplate = ({
  content,
  options,
  disabled = false,
  onQuickReplyClick,
  isSimulator = false,
  showHeader = true,
  bspMessageId,
}: QuickReplyTemplateProps) => {
  if (!content && !options) {
    return null;
  }

  const quickReplyButtons = options
    .map((option: ButtonOption, index: number) => {
      if (option.title) {
        const payloadObject = {
          payload: {
            postbackText: option.postbackText ?? '',
            type: 'button_reply',
            title: option.title,
            id: '',
            reply: `${option.title} ${index + 1}`,
          },
          context: {
            id: '',
            gsId: bspMessageId,
          },
        };
        return (
          <div className={styles.ButtonItem} key={uuidv4()}>
            <Button
              variant="contained"
              color="default"
              disabled={disabled}
              onClick={() => onQuickReplyClick(payloadObject)}
              className={isSimulator ? styles.SimulatorButton : styles.ChatMessageButton}
            >
              {option.title}
            </Button>
          </div>
        );
      }
      return null;
    })
    .filter((a) => a);

  const { type, url, header = '', text = '', filename = '', caption } = content;
  const media = type === 'text' ? {} : { url, text };
  const contentType = type === 'file' ? 'DOCUMENT' : type.toUpperCase();
  return (
    <div>
      <div className={styles.MessageContent}>
        {header && showHeader && <div className={styles.TitleText}>{header}</div>}
        <ChatMessageType
          type={contentType}
          body={text || filename}
          media={media}
          location={{}}
          isSimulatedMessage={isSimulator}
        />
        {contentType === 'DOCUMENT' && <MessagesWithLinks message={media.text} />}
        {caption && <div className={styles.Caption}>{caption}</div>}
      </div>
      <div className={styles.ButtonContainer}>{quickReplyButtons}</div>
    </div>
  );
};
