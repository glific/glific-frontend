import React from 'react';
import { Paper } from '@material-ui/core';

import styles from './ChatPage.module.css';
import { ChatMessages } from '../../../containers/Chat/ChatMessages/ChatMessages';
import { ChatConversations } from '../../../containers/Chat/ChatConversations/ChatConversations';

export interface ChatPageProps {}

const ChatPage: React.SFC<ChatPageProps> = () => {
  // what do we need here?
  // <ChatMessages>
  //   <ContactBar></ContactBar>
  //   <Message></Message>
  //   <ChatInput></ChatInput>
  // </ChatMessages>
  // <ChatConversations>
  // </ChatConversations>
  return (
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
  );
};

export default ChatPage;
