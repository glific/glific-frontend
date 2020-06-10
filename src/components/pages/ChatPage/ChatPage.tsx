import React from 'react';
import { Paper, Container } from '@material-ui/core';

import styles from './ChatPage.module.css';
import { ChatMessages } from '../../../containers/Chat/ChatMessages/ChatMessages';
import { ChatConversations } from '../../../containers/Chat/ChatConversations/ChatConversations';

export interface ChatPageProps {}

const ChatPage: React.SFC<ChatPageProps> = () => {
  return (
    <Container>
      <Paper>
        <div className={styles.ChatPage}>
          <div className={styles.ChatMessages}>
            <ChatMessages />
          </div>
          <div className={styles.ChatConversations}>
            <ChatConversations />
          </div>
        </div>
      </Paper>
    </Container>
  );
};

export default ChatPage;
