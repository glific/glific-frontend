import React, { useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';

import { ContactBar } from './ContactBar/ContactBar';
import { ChatMessage } from './ChatMessage/ChatMessage';
import { ChatInput } from './ChatInput/ChatInput';
import styles from './ChatMessages.module.css';
import {
  GET_CONVERSATION_MESSAGE_QUERY,
  CREATE_MESSAGE_MUTATION,
} from '../../../graphql/queries/Chat';
import { Container } from '@material-ui/core';

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

interface ConversationResult {
  chatMessages: any[];
}

type OptionalChatQueryResult = ChatMessagesInterface | null;

export const ChatMessages: React.SFC<ChatMessagesProps> = ({ chatId }) => {
  const { loading, error, data } = useQuery<any>(GET_CONVERSATION_MESSAGE_QUERY, {
    variables: {
      nc: 1,
      sc: 100,
      filter: { id: chatId },
    },
  });

  const chatMessages = data?.conversations;
  const [createMessage] = useMutation(CREATE_MESSAGE_MUTATION);

  const onSendMessage = useCallback(
    (body: string) => {
      const payload = {
        body: body,
        senderId: 1,
        receiverId: chatId,
        type: 'TEXT',
        flow: 'OUTBOUND',
      };

      createMessage({
        variables: { input: payload },
        optimisticResponse: {
          __typename: 'Mutation',
          createMessage: {
            __typename: 'Message',
            body: body,
            senderId: 1,
            receiverId: chatId,
            flow: 'OUTBOUND',
            type: 'TEXT',
          },
        },
        update: (client, { data }) => {
          if (data && data.createMessage) {
            // add new conversation
            const newConversations = {
              ...chatMessages[0],
              messages: chatMessages[0].messages.concat(data.createMessage.message),
            };

            client.writeQuery({
              query: GET_CONVERSATION_MESSAGE_QUERY,
              variables: { chatId },
              data: {
                chatMessages: { ...chatMessages, 0: { ...newConversations } },
              },
            });
          }
        },
      });
    },
    [chatMessages, chatId, createMessage]
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  let messageList;
  let contactName;

  if (chatMessages.length > 0) {
    contactName = chatMessages[0].contact.name;
    messageList = chatMessages.map((conversation: any) => {
      return conversation.messages.map((message: any, index: number) => {
        return <ChatMessage {...message} key={index} />;
      });
    });
  }

  return (
    <Container className={styles.ChatMessages} disableGutters>
      <ContactBar contactName={contactName} />
      <Container className={styles.MessageList}>{messageList}</Container>
      <ChatInput onSendMessage={onSendMessage} />
    </Container>
  );
};

export default ChatMessages;
