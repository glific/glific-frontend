import React, { useState } from 'react';
import { useQuery } from '@apollo/client';

import { ContactBar } from './ContactBar/ContactBar';
import { ChatMessage } from './ChatMessage/ChatMessage';
import { ChatInput } from './ChatInput/ChatInput';
import styles from './ChatMessages.module.css';
import { GET_CONVERSATION_MESSAGE_QUERY } from '../../../graphql/queries/Chat';

export interface ChatMessagesProps {
  chatId: string;
}

interface ConversationMessage {
  id: string;
  body: string;
}

interface ChatMessagesInterface {
  conversations: {
    contact: {
      id: string;
      name: string;
    };
    messages: Array<ConversationMessage>;
  };
}

type OptionalChatQueryResult = ChatMessagesInterface | null;

export const ChatMessages: React.SFC<ChatMessagesProps> = ({ chatId }) => {
  const [chat, setChat] = useState<OptionalChatQueryResult>(null);

  const { loading, error, data } = useQuery<any>(GET_CONVERSATION_MESSAGE_QUERY, {
    variables: {
      nc: 1,
      sc: 25,
      filter: { id: chatId },
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  if (data === undefined || data.conversations === undefined) {
    return null;
  }

  let conversations = data.conversations;

  let messageList;
  let contactName;
  if (conversations.length > 0) {
    contactName = conversations[0].contact.name;
    messageList = conversations.map((conversation: any) => {
      return conversation.messages.map((message: any, index: number) => {
        return <ChatMessage {...message} key={index} />;
      });
    });
  }

  return (
    <div className={styles.ChatMessages}>
      <ContactBar contactName={contactName} />
      <div className={styles.MessageList}>{messageList}</div>
      <ChatInput />
    </div>
  );
};

export default ChatMessages;
