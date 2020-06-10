import React from 'react';

import styles from './ChatMessage.module.css'

export interface ChatMessageProps {
  content: string;
  date: string;
}

export const ChatMessage: React.SFC<ChatMessageProps> = (props) => {

  return (

    <div className={styles.ChatMessage}>
      <span>{props.date}</span>
      <p className={styles.Content}>{props.content}</p>
    </div>
  );
};

export default ChatMessage;
