import React from 'react';
import { Button } from '@material-ui/core';
import { v4 as uuidv4 } from 'uuid';

import styles from './QuickReplyTemplate.module.css';
import { ChatMessageType } from '../ChatMessage/ChatMessageType/ChatMessageType';

interface Content {
  type: string;
  url?: string;
  header?: string;
  text?: string;
  filename?: string;
}

interface ButtonOption {
  type: string;
  title: string;
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

export const QuickReplyTemplate: React.SFC<QuickReplyTemplateProps> = (props) => {
  const {
    content,
    options,
    disabled = false,
    onQuickReplyClick,
    isSimulator = false,
    showHeader = true,
    bspMessageId,
  } = props;

  if (!content && !options) {
    return null;
  }

  const quickReplyButtons = options
    .map((option: ButtonOption, index: number) => {
      if (option.title) {
        const payloadObject = {
          payload: {
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

  const { type, url, header = '', text = '', filename = '' } = content;
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
      </div>
      <div className={styles.ButtonContainer}>{quickReplyButtons}</div>
    </div>
  );
};
