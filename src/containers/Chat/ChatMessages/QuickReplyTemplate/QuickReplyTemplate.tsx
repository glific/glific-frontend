import React from 'react';
import { Button } from '@material-ui/core';

import styles from './QuickReplyTemplate.module.css';
import { ChatMessageType } from '../ChatMessage/ChatMessageType/ChatMessageType';

interface Content {
  type: string;
  url?: string;
  caption: string;
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

  const quickReplyButtons = options.map((option: ButtonOption) => (
    <div className={styles.ButtonItem}>
      <Button
        key={option.title}
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

  const { type, url, caption } = content;

  const media = type === 'text' ? {} : { url, caption };
  return (
    <div>
      <ChatMessageType
        type={type.toUpperCase()}
        body={caption}
        media={media}
        location={{}}
        isSimulatedMessage={isSimulator}
      />
      <div className={styles.ButtonContainer}>{quickReplyButtons}</div>
    </div>
  );
};
