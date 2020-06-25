import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import { Container } from '@material-ui/core';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

import styles from './ChatInput.module.css';

export interface ChatInputProps {
  onSendMessage(content: string): any;
}

export const ChatInput: React.SFC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const keyPressHandler = (e: any) => {
    if (e.key === 'Enter') {
      if (!message) return;

      setMessage('');

      if (typeof onSendMessage === 'function') {
        onSendMessage(message);
      }
    }
  };

  const changeHandler = ({ target }: any) => {
    setMessage(target.value);
  };

  let emojiPicker;
  if (showEmojiPicker) {
    emojiPicker = (
      <Picker
        data-testid="emoji-popup"
        title="Pick your emoji…"
        emoji="point_up"
        style={{ position: 'absolute', bottom: '190px', right: '444px' }}
        onSelect={(emoji: any) => setMessage(message + emoji.native)}
      />
    );
  }

  return (
    <Container className={styles.ChatInput}>
      <div className={styles.InputContainer}>
        <input
          className={styles.InputBox}
          data-testid="message-input"
          type="text"
          placeholder="Type a message"
          value={message}
          onKeyPress={keyPressHandler}
          onChange={changeHandler}
          onClick={() => setShowEmojiPicker(false)}
        />
      </div>
      <div className={styles.EmojiPicker}>
        <IconButton
          data-testid="emoji-picker"
          color="primary"
          aria-label="pick emoji"
          component="span"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <span role="img" aria-label="pick emoji">
            😀
          </span>
        </IconButton>
      </div>
      {emojiPicker}
    </Container>
  );
};

export default ChatInput;
