import React, { useCallback, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Container } from '@material-ui/core';
import { DialogBox } from '../../../components/UI/DialogBox/DialogBox';

import { ContactBar } from './ContactBar/ContactBar';
import { ChatMessage } from './ChatMessage/ChatMessage';
import { ChatInput } from './ChatInput/ChatInput';
import styles from './ChatMessages.module.css';
import { GET_CONVERSATION_MESSAGE_QUERY } from '../../../graphql/queries/Chat';
import { CREATE_MESSAGE_MUTATION } from '../../../graphql/mutations/Chat';
import Loading from '../../../components/UI/Layout/Loading/Loading';

export interface ChatMessagesProps {
  contactId: string;
}

interface ConversationMessage {
  id: string;
  body: string;
  insertedAt: string;
  receiver: {
    id: string;
  };
  sender: {
    id: string;
  };
  tags: {
    id: string;
    label: string;
  };
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

export const ChatMessages: React.SFC<ChatMessagesProps> = ({ contactId }) => {
  const [popup, setPopup] = useState(null);
  const [dialog, setDialogbox] = useState(false);
  // let's get the conversation for last contacted contact.
  const queryVariables = {
    size: 25,
    contactId: contactId,
    filter: {},
  };
  const { loading, error, data } = useQuery<any>(GET_CONVERSATION_MESSAGE_QUERY, {
    variables: queryVariables,
  });

  const [createMessage] = useMutation(CREATE_MESSAGE_MUTATION);

  // this function is called when the message is sent
  const sendMessageHandler = useCallback(
    (body: string) => {
      const payload = {
        body: body,
        senderId: 1,
        receiverId: contactId,
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
            receiverId: contactId,
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
            messagesCopy.conversation.messages = messagesCopy.conversation.messages.push(message);
            cache.writeQuery({
              query: GET_CONVERSATION_MESSAGE_QUERY,
              variables: queryVariables,
              data: messagesCopy,
            });
          }
        },
      });
    },
    [contactId, createMessage, queryVariables]
  );

  if (loading) return <Loading />;
  if (error) return <p>Error :(</p>;

  const closeDialogBox = () => {
    setDialogbox(false);
  };

  const handleDeleteTag = () => {
    setDialogbox(false);
  };

  let dialogBox;
  if (dialog) {
    dialogBox = (
      <DialogBox
        message="Are you sure you want to delete the tag?"
        handleCancel={closeDialogBox}
        handleOK={handleDeleteTag}
      />
    );
  }

  const showPopup = (id: any) => {
    if (id === popup) {
      setPopup(null);
    } else {
      setPopup(id);
    }
  };

  const conversations = data?.conversation;

  // we are always loading first conversation, hence incase chatid is not passed set it
  if (contactId === undefined) {
    contactId = conversations.contact.id;
  }

  let messageList;
  if (conversations.messages.length > 0) {
    messageList = conversations.messages.map((message: any, index: number) => {
      return (
        <ChatMessage
          {...message}
          contactId={contactId}
          key={index}
          popup={message.id === popup}
          onClick={() => showPopup(message.id)}
          setDialog={() => setDialogbox(!dialog)}
        />
      );
    });
  }

  return (
    <Container className={styles.ChatMessages} disableGutters>
      {dialogBox}
      <ContactBar contactName={conversations.contact.name} />
      <Container className={styles.MessageList}>{messageList}</Container>
      <ChatInput onSendMessage={sendMessageHandler} />
    </Container>
  );
};

export default ChatMessages;
