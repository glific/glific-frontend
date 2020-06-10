import React from 'react';

import styles from './ChatInput.module.css';

export interface ChatInputProps { }

export const ChatInput: React.SFC<ChatInputProps> = () => {
  return (
    <div className={styles.ChatInput}>
      <textarea></textarea>
    </div>
  );
};

export default ChatInput;
