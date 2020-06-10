import React, { useState } from 'react';
import { Paper } from '@material-ui/core';

import styles from './ChatPage.module.css';
import { ChatMessages } from '../ChatMessages/ChatMessages';
import { ChatConversations } from '../ChatConversations/ChatConversations';

const chatData = [
  {
    contactId: 1,
    contactName: 'Jane Doe',
    messages: [
      {
        date: 'June 1, 2020',
        content: 'Hello!'
      },
      {
        date: 'June 2, 2020',
        content: 'Can I get some help!'
      },
      {
        date: 'June 4, 2020',
        content: 'Anyone available help!'
      },
    ]
  },
  {
    contactId: 2,
    contactName: 'Mary Jane',
    messages: [
      {
        date: 'June 3, 2020',
        content: 'Hi'
      },
      {
        date: 'June 4, 2020',
        content: 'Can I get some help!'
      },
      {
        date: 'June 5, 2020',
        content: 'Anyone available help!'
      },
    ]
  },
  {
    contactId: 3,
    contactName: 'Tony Stark',
    messages: [
      {
        date: 'June 6, 2020',
        content: 'Can I get some help!'
      },
      {
        date: 'June 7, 2020',
        content: 'Help needed!'
      },
      {
        date: 'June 8, 2020',
        content: 'Anyone available help!'
      },
    ]
  },
  {
    contactId: 4,
    contactName: 'Bary Allen',
    messages: [
      {
        date: 'June 6, 2020',
        content: 'Anyone available help!',
      },
      {
        date: 'June 7, 2020',
        content: 'Can I get some help!'
      },
      {
        date: 'June 8, 2020',
        content: 'Help needed!',
      },
    ]
  },
  {
    contactId: 5,
    contactName: 'Black Widow',
    messages: [
      {
        date: 'June 5, 2020',
        content: 'Help needed!'
      },
      {
        date: 'June 7, 2020',
        content: 'Can I get some help!'
      },
      {
        date: 'June 9, 2020',
        content: 'Anyone available help!'
      },
    ]
  },
  {
    contactId: 6,
    contactName: 'Wonder Woman',
    messages: [
      {
        date: 'June 6, 2020',
        content: 'Anyone available help!'
      },
      {
        date: 'June 7, 2020',
        content: 'Can I get some help!'
      },
      {
        date: 'June 7, 2020',
        content: 'Help!'
      },
    ]
  },
  {
    contactId: 6,
    contactName: 'Peter Parker',
    messages: [
      {
        date: 'June 6, 2020',
        content: 'Can I get some help!'
      },
      {
        date: 'June 7, 2020',
        content: 'Can I get some help!'
      },
      {
        date: 'June 7, 2020',
        content: 'Anyone!'
      },
    ]
  },
]

export interface ChatPageProps { }

const ChatPage: React.SFC<ChatPageProps> = () => {
  const [selectedConversation, setSelectedConversation] = useState(0);

  const conservationData = chatData[selectedConversation];

  //setSelectedConversation(0);

  return (
    <Paper>
      <div className={styles.ChatPage}>
        <div className={styles.ChatMessages}>
          <ChatMessages chatMessages={conservationData} />
        </div>
        <div className={styles.ChatConversations}>
          <ChatConversations conversations={chatData} selectedConversation={selectedConversation} />
        </div>
      </div>
    </Paper>
  );
};

export default ChatPage;
