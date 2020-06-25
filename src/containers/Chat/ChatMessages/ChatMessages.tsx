import React, { useCallback, useState } from 'react';
import { useQuery, useMutation, useLazyQuery, useApolloClient } from '@apollo/client';
import { Container, FormGroup } from '@material-ui/core';
import { DialogBox } from '../../../components/UI/DialogBox/DialogBox';
import { setNotification } from '../../../common/notification';
import { NOTIFICATION } from '../../../graphql/queries/Notification';
import { ContactBar } from './ContactBar/ContactBar';
import { ChatMessage } from './ChatMessage/ChatMessage';
import { ChatInput } from './ChatInput/ChatInput';
import styles from './ChatMessages.module.css';
import { ToastMessage } from '../../../components/UI/ToastMessage/ToastMessage';
import { TextField, FormControlLabel, Checkbox } from '@material-ui/core';
import { GET_CONVERSATION_MESSAGE_QUERY } from '../../../graphql/queries/Chat';
import { CREATE_MESSAGE_MUTATION, CREATE_MESSAGE_TAG } from '../../../graphql/mutations/Chat';
import Loading from '../../../components/UI/Layout/Loading/Loading';
import { GET_TAGS } from '../../../graphql/queries/Tag';

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
  const client = useApolloClient();
  const message = useQuery(NOTIFICATION);
  const [loadTags, Tags] = useLazyQuery(GET_TAGS);
  const [popup, setPopup] = useState(null);
  const [dialog, setDialogbox] = useState(false);
  const [search, setSearch] = useState('');

  const [createMessageTag] = useMutation(CREATE_MESSAGE_TAG, {
    onCompleted: (data) => {
      setPopup(null);
      mySet.clear();
      setSearch('');
      setNotification(client, 'Tags added succesfully');
      setDialogbox(false);
    },
    update: (cache, { data }) => {
      const messages: any = cache.readQuery({
        query: GET_CONVERSATION_MESSAGE_QUERY,
        variables: queryVariables,
      });

      const messagesCopy = JSON.parse(JSON.stringify(messages));
      if (data.createMessageTag.messageTag.tag) {
        const tag = data.createMessageTag.messageTag.tag;
        messagesCopy.conversation.messages = messagesCopy.conversation.messages.map(
          (message: any) => {
            if (message.id == data.createMessageTag.messageTag.message.id) {
              message.tags.push(tag);
              return message;
            } else return message;
          }
        );

        cache.writeQuery({
          query: GET_CONVERSATION_MESSAGE_QUERY,
          variables: queryVariables,
          data: messagesCopy,
        });
      }
    },
  });
  // let's get the conversation for last contacted contact.
  // TODO Temporary fix
  if (!contactId) {
    contactId = '2';
  }

  const queryVariables = {
    contactId: contactId,
    filter: {},
    messageOpts: {
      limit: 25,
    },
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

  //toast
  const closeToastMessage = () => {
    setNotification(client, null);
  };

  let toastMessage;
  if (message.data && message.data.message) {
    toastMessage = <ToastMessage message={message.data.message} handleClose={closeToastMessage} />;
  }

  const closeDialogBox = () => {
    setDialogbox(false);
    setPopup(null);
  };
  let mySet = new Set();

  const handleSubmit = () => {
    mySet.forEach((value) => {
      createMessageTag({
        variables: {
          input: {
            messageId: popup,
            tagId: value,
          },
        },
      });
    });
  };

  const handleCheckbox = (event: any) => {
    if (mySet.has(event.target.name)) mySet.delete(event.target.name);
    else mySet.add(event.target.name);

    console.log(mySet, popup);
  };

  let dialogBox;
  if (dialog) {
    const tagList = Tags.data
      ? Tags.data.tags.map((tag: any) => {
          if (tag.label.toLowerCase().includes(search)) {
            return (
              <FormControlLabel
                control={<Checkbox name={tag.id} color="primary" />}
                label={tag.label}
              />
            );
          } else {
            return null;
          }
        })
      : null;
    dialogBox = (
      <DialogBox
        title="Assign tag to message"
        handleCancel={closeDialogBox}
        handleOk={handleSubmit}
      >
        <div className={styles.DialogBox}>
          <TextField
            className={styles.SearchInput}
            id="outlined-basic"
            label="Search"
            variant="outlined"
            onChange={(event) => setSearch(event.target.value)}
            fullWidth
          />
          <div>
            <form onChange={handleCheckbox} className={styles.Form}>
              <FormGroup>{tagList}</FormGroup>
            </form>
          </div>
        </div>
      </DialogBox>
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
          setDialog={() => {
            loadTags();
            setDialogbox(!dialog);
          }}
        />
      );
    });
  }

  return (
    <Container className={styles.ChatMessages} disableGutters>
      {dialogBox}
      {toastMessage}
      <ContactBar contactName={conversations.contact.name} />
      <Container className={styles.MessageList}>{messageList}</Container>
      <ChatInput onSendMessage={sendMessageHandler} />
    </Container>
  );
};

export default ChatMessages;
