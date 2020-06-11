import React from 'react';
import Button from '@material-ui/core/Button';
import SendIcon from '@material-ui/icons/Send';

import styles from './ChatInput.module.css';

export interface ChatInputProps { }

export const ChatInput: React.SFC<ChatInputProps> = () => {
  return (
    <div className={styles.ChatInput}>
      <input
        className={styles.InputBox}
        data-testid="message-input"
        type="text"
        placeholder="Type a message"
      // value={message}
      // onKeyPress={onKeyPress}
      // onChange={onChange}
      />

      <Button
        className={styles.SendButton}
        data-testid="send-button"
        variant="contained"
        color="primary"
      // onClick={submitMessage}>
      >
        <SendIcon />
      </Button>
    </div >
  );
};

export default ChatInput;
