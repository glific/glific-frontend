import React from 'react';
import { Paper } from '@material-ui/core';

import ChatMessages from './ChatMessages/ChatMessages';
import ChatConversations from './ChatConversations/ChatConversations';
import styles from './Chat.module.css';

export interface ChatProps {
  contactId: string;
}

const Chat: React.SFC<ChatProps> = ({ contactId }) => {
  return (
    <Paper>
      <div className={styles.Chat}>
        <div className={styles.ChatMessages}>
          <ChatMessages contactId={contactId} />
        </div>
        <div className={styles.ChatConversations}>
          <ChatConversations />
        </div>
      </div>
    </Paper>
  );
};

export default Chat;
