import React from 'react';

import styles from './ChatMessage.module.css';

export interface ChatMessageProps {
  id: string;
  body: string;
  // date: string;
}

export const ChatMessage: React.SFC<ChatMessageProps> = (props) => {
  return (
    <div className={styles.ChatMessage}>
      <div className={styles.Content}>{props.body}</div>
      <div className={styles.Date}>June 3, 2020</div>
    </div>
  );
};

export default ChatMessage;
