import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import SendIcon from '@material-ui/icons/Send';
import { Container } from '@material-ui/core';

import styles from './ChatInput.module.css';

export interface ChatInputProps {
  onSendMessage(content: string): any;
}

export const ChatInput: React.SFC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const onKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      submitMessage();
    }
  };

  const onChange = ({ target }: any) => {
    setMessage(target.value);
  };

  const submitMessage = () => {
    if (!message) return;

    setMessage('');

    if (typeof onSendMessage === 'function') {
      onSendMessage(message);
    }
  };

  return (
    <Container className={styles.ChatInput}>
      <input
        className={styles.InputBox}
        data-testid="message-input"
        type="text"
        placeholder="Type a message"
        value={message}
        onKeyPress={onKeyPress}
        onChange={onChange}
      />

      <Button
        className={styles.SendButton}
        data-testid="send-button"
        variant="contained"
        color="primary"
        onClick={submitMessage}
      >
        <SendIcon />
      </Button>
    </Container>
  );
};

export default ChatInput;
