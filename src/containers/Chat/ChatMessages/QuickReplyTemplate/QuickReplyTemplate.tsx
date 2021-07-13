import React from 'react';
import { Button } from '@material-ui/core';

import styles from './QuickReplyTemplate.module.css';
import { ChatMessageType } from '../ChatMessage/ChatMessageType/ChatMessageType';

interface Content {
  type: string;
  url?: string;
  caption?: string;
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
  isSimulator: boolean;
}

export const QuickReplyTemplate: React.SFC<QuickReplyTemplateProps> = (props) => {
  const { content, options, disabled = false, onQuickReplyClick, isSimulator = false } = props;

  if (!content && !options) {
    return null;
  }

  const quickReplyButtons = options.map((option: ButtonOption) => (
    <div className={styles.ButtonItem} key={option.title}>
      <Button
        variant="contained"
        color="default"
        disabled={disabled}
        onClick={() => onQuickReplyClick(option.title)}
        className={isSimulator ? styles.SimulatorButton : styles.ChatMessageButton}
      >
        {option.title}
      </Button>
    </div>
  ));

  const { type, url, caption = '', text = '', filename = '' } = content;

  const media = type === 'text' ? {} : { url, caption };
  const contentType = type === 'file' ? 'DOCUMENT' : type.toUpperCase();
  return (
    <div>
      <div className={styles.MessageContent}>
        {text && (
          <div className={styles.TitleText}>
            <ChatMessageType
              type={contentType}
              body={text}
              media={{}}
              location={{}}
              isSimulatedMessage={isSimulator}
            />
          </div>
        )}
        <ChatMessageType
          type={contentType}
          body={caption || filename}
          media={media}
          location={{}}
          isSimulatedMessage={isSimulator}
        />
      </div>
      <div className={styles.ButtonContainer}>{quickReplyButtons}</div>
    </div>
  );
};
