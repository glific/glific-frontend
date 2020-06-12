import React from 'react';
import { Paper } from '@material-ui/core';

import styles from './ChatPage.module.css';
import { ChatMessages } from '../../../containers/Chat/ChatMessages/ChatMessages';
import { ChatConversations } from '../../../containers/Chat/ChatConversations/ChatConversations';

export interface ChatPageProps {
  chatId: string;
}


const ChatPage: React.SFC<ChatPageProps> = ({ chatId }) => {

  return (
    <Paper>
      <div className={styles.ChatPage}>
        <div className={styles.ChatMessages}>
          <ChatMessages chatId={chatId} />
        </div>
        <div className={styles.ChatConversations}>
          <ChatConversations />
        </div>
      </div>
    </Paper>
  );
};

export default ChatPage;
