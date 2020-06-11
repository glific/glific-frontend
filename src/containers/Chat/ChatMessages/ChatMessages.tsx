import React from 'react';

import { ContactBar } from './ContactBar/ContactBar';
import { ChatMessage } from './ChatMessage/ChatMessage';
import { ChatInput } from './ChatInput/ChatInput';
import styles from './ChatMessages.module.css';

export interface ChatMessagesProps {
  //TO FIX: define clear type once this is hooked with backend
  chatMessages: any;
}

export const ChatMessages: React.SFC<ChatMessagesProps> = (props) => {
  const messageList = props.chatMessages.messages.map((message: any, index: number) => {
    return <ChatMessage {...message} key={index} />;
  });

  return (
    <div className={styles.ChatMessages}>
      <ContactBar contactName={props.chatMessages.contactName} />
      <div className={styles.MessageList}>{messageList}</div>
      <ChatInput />
    </div>
  );
};

export default ChatMessages;
