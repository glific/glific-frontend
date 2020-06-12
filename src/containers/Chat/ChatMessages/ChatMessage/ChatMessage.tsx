import React from 'react';

import styles from './ChatMessage.module.css';

export interface ChatMessageProps {
  id: string
  body: string;
  // date: string;
}

export const ChatMessage: React.SFC<ChatMessageProps> = (props) => {
  return (
    <div className={styles.ChatMessage}>
      <span>June 3, 2020</span>
      <p className={styles.Content}>{props.body}</p>
    </div>
  );
};

export default ChatMessage;
