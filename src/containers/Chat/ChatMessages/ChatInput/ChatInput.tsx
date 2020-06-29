import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import { Container, Button } from '@material-ui/core';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

import styles from './ChatInput.module.css';

import sendMessageIcon from '../../../../assets/images/icons/SendMessage.svg';

export interface ChatInputProps {
  onSendMessage(content: string): any;
}

export const ChatInput: React.SFC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const keyPressHandler = (e: any) => {
    if (e.key === 'Enter') {
      submitMessage();
    }
  };

  const changeHandler = ({ target }: any) => {
    setMessage(target.value);
  };

  const submitMessage = () => {
    if (!message) return;

    setMessage('');

    if (typeof onSendMessage === 'function') {
      onSendMessage(message);
    }
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
      <div className={styles.ChatInputElements}>
        <div className={styles.InputContainer}>
          <input
            className={styles.InputBox}
            data-testid="message-input"
            type="text"
            placeholder="Start typing..."
            value={message}
            onKeyPress={keyPressHandler}
            onChange={changeHandler}
            onClick={() => setShowEmojiPicker(false)}
          />
        </div>
        <div className={styles.EmojiContainer}>
          <IconButton
            data-testid="emoji-picker"
            color="primary"
            aria-label="pick emoji"
            component="span"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😀
          </IconButton>
        </div>
        <div className={styles.SendButtonContainer}>
          <Button
            className={styles.SendButton}
            data-testid="send-button"
            variant="contained"
            color="primary"
            onClick={submitMessage}
            disabled={message.length === 0}
          >
            Send
            <img className={styles.SendIcon} src={sendMessageIcon} alt="Send Message" />
          </Button>
        </div>
      </div>
      {emojiPicker}
    </Container>
  );
};

export default ChatInput;
