import React from 'react';

import styles from './ChatMessage.module.css'
import { Typography } from '@material-ui/core';

export interface ChatMessageProps {
  content: string;
  date: string;
}

export const ChatMessage: React.SFC<ChatMessageProps> = (props) => {

  return (

    <div>
      <p className={styles.Content}>{props.content}</p>
    </div>
  );
};

export default ChatMessage;
