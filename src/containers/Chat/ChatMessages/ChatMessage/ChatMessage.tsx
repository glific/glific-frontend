import React from 'react';
import moment from 'moment';

import styles from './ChatMessage.module.css';

export interface ChatMessageProps {
  id: string;
  body: string;
  contactId: string;
  receiver: {
    id: string;
  };
  insertedAt: string;
}

export const ChatMessage: React.SFC<ChatMessageProps> = (props) => {
  let additionalClass = styles.Mine;

  if (props.receiver.id === props.contactId) {
    additionalClass = styles.Other;
  }

  return (
    <div className={[styles.ChatMessage, additionalClass].join(' ')}>
      <div className={styles.Content}>{props.body}</div>
      <div className={styles.Date}>{moment(props.insertedAt).format('HH:mm')}</div>
    </div>
  );
};

export default ChatMessage;
