import React, { useCallback, useState } from 'react';
import { useQuery, useMutation, useLazyQuery, useApolloClient } from '@apollo/client';
import { Container, FormGroup, TextField, FormControlLabel, Checkbox } from '@material-ui/core';

import { DialogBox } from '../../../components/UI/DialogBox/DialogBox';
import { setNotification } from '../../../common/notification';
import { ContactBar } from './ContactBar/ContactBar';
import { ChatMessage } from './ChatMessage/ChatMessage';
import { ChatInput } from './ChatInput/ChatInput';
import styles from './ChatMessages.module.css';
import moment from 'moment';
import { DATE_FORMAT, TIME_FORMAT } from '../../../common/constants';
import { ToastMessage } from '../../../components/UI/ToastMessage/ToastMessage';
import Loading from '../../../components/UI/Layout/Loading/Loading';

import { NOTIFICATION } from '../../../graphql/queries/Notification';
import { GET_CONVERSATION_MESSAGE_QUERY } from '../../../graphql/queries/Chat';
import { GET_CONVERSATION_QUERY } from '../../../graphql/queries/Chat';
import { CREATE_MESSAGE_MUTATION, CREATE_MESSAGE_TAG } from '../../../graphql/mutations/Chat';
import { GET_TAGS } from '../../../graphql/queries/Tag';

export interface ChatMessagesProps {
  conversationIndex: number;
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

export const ChatMessages: React.SFC<ChatMessagesProps> = ({ conversationIndex }) => {
  // create an instance of apolloclient
  const client = useApolloClient();

  const message = useQuery(NOTIFICATION);
  const [loadAllTags, AllTags] = useLazyQuery(GET_TAGS);
  const [editTagsMessageId, setEditTagsMessageId] = useState<number | null>(null);
  const [dialog, setDialogbox] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMessageTags, setSelectedMessageTags] = useState<any>(null);

  // create message mutation
  const [createMessage] = useMutation(CREATE_MESSAGE_MUTATION);

  // tagging message mutation
  const [createMessageTag] = useMutation(CREATE_MESSAGE_TAG, {
    onCompleted: (data) => {
      setEditTagsMessageId(null);
      setSearch('');
      setNotification(client, 'Tags added succesfully');
      setDialogbox(false);
      setSelectedMessageTags(null);
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
            if (message.id === data.createMessageTag.messageTag.message.id) {
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

  // get the conversations stored from the cache
  const queryVariables = {
    contactOpts: {
      limit: 50,
    },
    filter: {},
    messageOpts: {
      limit: 100,
    },
  };

  const data: any = client.readQuery({
    query: GET_CONVERSATION_QUERY,
    variables: queryVariables,
  });

  // use contact id to filter if it is passed via url, else use the first conversation
  let conversationInfo: any = [];
  if (!conversationIndex) {
    conversationIndex = 0;
  }

  conversationInfo = data.conversations[conversationIndex];
  const receiverId = data.conversations[conversationIndex].contact.id;

  // this function is called when the message is sent
  const sendMessageHandler = useCallback(
    (body: string) => {
      const payload = {
        body: body,
        senderId: 1,
        receiverId: receiverId,
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
            receiverId: receiverId,
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
            messagesCopy.conversation.messages = [message, ...messagesCopy.conversation.messages];
            cache.writeQuery({
              query: GET_CONVERSATION_MESSAGE_QUERY,
              variables: queryVariables,
              data: messagesCopy,
            });
          }
        },
      });
    },
    [createMessage, queryVariables, receiverId]
  );

  //toast
  const closeToastMessage = () => {
    setNotification(client, null);
  };

  let toastMessage;
  if (message.data && message.data.message) {
    toastMessage = <ToastMessage message={message.data.message} handleClose={closeToastMessage} />;
  }

  const closeDialogBox = () => {
    setSelectedMessageTags(null);
    setDialogbox(false);
    setEditTagsMessageId(null);
    setSearch('');
  };

  const handleSubmit = () => {
    const tagsForm = document.getElementById('tagsForm');
    let messageTags: any = tagsForm?.querySelectorAll('input[type="checkbox"]');
    messageTags = [].slice.call(messageTags);
    const selectedTags = messageTags.filter((tag: any) => tag.checked).map((tag: any) => tag.name);

    if (selectedTags.size === 0) {
      setDialogbox(false);
      setEditTagsMessageId(null);
    } else {
      selectedTags.forEach((tagId: number) => {
        createMessageTag({
          variables: {
            input: {
              messageId: editTagsMessageId,
              tagId: tagId,
            },
          },
        });
      });
    }
  };

  //const conversations = conversationMessages;

  let dialogBox;

  if (dialog) {
    const tagList = AllTags.data
      ? AllTags.data.tags.map((tag: any) => {
          if (tag.label.toLowerCase().includes(search)) {
            return (
              <FormControlLabel
                key={tag.id}
                control={
                  <Checkbox
                    data-testid="dialogCheckbox"
                    name={tag.id}
                    color="primary"
                    checked={selectedMessageTags?.includes(tag.id.toString())}
                    onChange={(event: any) => {
                      if (selectedMessageTags?.includes(event?.target.name.toString())) {
                        setSelectedMessageTags(
                          selectedMessageTags?.filter(
                            (messageTag: any) => messageTag != event?.target.name
                          )
                        );
                      } else {
                        setSelectedMessageTags([
                          ...selectedMessageTags,
                          event.target.name.toString(),
                        ]);
                      }
                    }}
                  />
                }
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
            <form id="tagsForm" className={styles.Form}>
              <FormGroup>{tagList}</FormGroup>
            </form>
          </div>
        </div>
      </DialogBox>
    );
  }

  const showEditTagsDialog = (id: number) => {
    if (id === editTagsMessageId) {
      setEditTagsMessageId(null);
    } else {
      setEditTagsMessageId(id);
    }
  };

  let messageList: any;
  if (conversationInfo.messages.length > 0) {
    let reverseConversation = [...conversationInfo.messages];
    reverseConversation = reverseConversation.map((message: any, index: number) => {
      return (
        <ChatMessage
          {...message}
          contactId={receiverId}
          key={index}
          popup={message.id === editTagsMessageId}
          onClick={() => showEditTagsDialog(message.id)}
          setDialog={() => {
            loadAllTags();

            let messageTags = conversationInfo.messages.filter(
              (message: any) => message.id === editTagsMessageId
            );
            if (messageTags.length > 0) {
              messageTags = messageTags[0].tags;
            }
            const messageTagId = messageTags.map((tag: any) => {
              return tag.id;
            });
            setSelectedMessageTags(messageTagId);
            setDialogbox(!dialog);
          }}
          focus={index === 0}
          showMessage={
            index != 0
              ? moment(reverseConversation[index].insertedAt).format(TIME_FORMAT) !==
                moment(reverseConversation[index - 1].insertedAt).format(TIME_FORMAT)
              : true
          }
        />
      );
    });

    messageList = reverseConversation.reverse();
  }

  return (
    <Container className={styles.ChatMessages} disableGutters>
      {dialogBox}
      {toastMessage}
      <ContactBar contactName={conversationInfo.contact.name} />
      <Container className={styles.MessageList} data-testid="messageContainer">
        {messageList}
      </Container>
      <ChatInput onSendMessage={sendMessageHandler} />
    </Container>
  );
};

export default ChatMessages;
