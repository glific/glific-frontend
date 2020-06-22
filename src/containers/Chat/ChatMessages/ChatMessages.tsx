import React, { useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Container } from '@material-ui/core';

import { ContactBar } from './ContactBar/ContactBar';
import { ChatMessage } from './ChatMessage/ChatMessage';
import { ChatInput } from './ChatInput/ChatInput';
import styles from './ChatMessages.module.css';
import { GET_CONVERSATION_MESSAGE_QUERY } from '../../../graphql/queries/Chat';
import { CREATE_MESSAGE_MUTATION } from '../../../graphql/mutations/Chat';

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
  // let's get the conversation for last contacted contact.
  const queryVariables = {
    count: 1,
    size: 25,
    filter: { id: chatId },
  };
  const { loading, error, data } = useQuery<any>(GET_CONVERSATION_MESSAGE_QUERY, {
    variables: queryVariables,
  });

  const conversations = data?.conversations;

  const [createMessage] = useMutation(CREATE_MESSAGE_MUTATION);

  // this function is called when the message is sent
  const sendMessageHandler = useCallback(
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
            id: Math.random().toString(36).substr(2, 9),
            body: body,
            senderId: 1,
            receiverId: chatId,
            flow: 'OUTBOUND',
            type: 'TEXT',
          },
        },
        update: (cache, { data }) => {
          const messages: any = cache.readQuery({
            query: GET_CONVERSATION_MESSAGE_QUERY,
            variables: queryVariables,
          });

          const messagesCopy = JSON.parse(JSON.stringify(messages));

          if (data.createMessage.message) {
            const message = data.createMessage.message;
            messagesCopy.conversations[0].messages = messagesCopy.conversations[0].messages.push(
              message
            );
            cache.writeQuery({
              query: GET_CONVERSATION_MESSAGE_QUERY,
              variables: queryVariables,
              data: messagesCopy,
            });
          }
        },
      });
    },
    [chatId, createMessage, queryVariables]
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  // we are always loading first conversation, hence incase chatid is not passed set it
  if (chatId === undefined) {
    chatId = conversations[0].contact.id;
  }

  let messageList;
  let contactName;
  if (conversations.length > 0) {
    // TO FIX: API should always return contact data
    contactName = conversations[0].contact.name;
    messageList = conversations.map((conversation: any) => {
      return conversation.messages.map((message: any, index: number) => {
        return <ChatMessage {...message} contactId={chatId} key={index} />;
      });
    });
  }

  return (
    <Container className={styles.ChatMessages} disableGutters>
      <ContactBar contactName={contactName} />
      <Container className={styles.MessageList}>{messageList}</Container>
      <ChatInput onSendMessage={sendMessageHandler} />
    </Container>
  );
};

export default ChatMessages;
