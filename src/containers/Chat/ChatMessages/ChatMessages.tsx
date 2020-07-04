import React, { useCallback, useState } from 'react';
import { useQuery, useMutation, useLazyQuery, useApolloClient } from '@apollo/client';
import { Container, FormGroup, TextField, FormControlLabel, Checkbox } from '@material-ui/core';
import moment from 'moment';

import { DialogBox } from '../../../components/UI/DialogBox/DialogBox';
import { setNotification } from '../../../common/notification';
import { ContactBar } from './ContactBar/ContactBar';
import { ChatMessage } from './ChatMessage/ChatMessage';
import { ChatInput } from './ChatInput/ChatInput';
import styles from './ChatMessages.module.css';
import { ToastMessage } from '../../../components/UI/ToastMessage/ToastMessage';
import { TIME_FORMAT } from '../../../common/constants';
import { NOTIFICATION } from '../../../graphql/queries/Notification';
import {
  GET_CONVERSATION_QUERY,
  GET_CONVERSATION_MESSAGE_QUERY,
} from '../../../graphql/queries/Chat';
import {
  CREATE_AND_SEND_MESSAGE_MUTATION,
  CREATE_MESSAGE_TAGS,
} from '../../../graphql/mutations/Chat';
import { GET_TAGS } from '../../../graphql/queries/Tag';
import Loading from '../../../components/UI/Layout/Loading/Loading';

export interface ChatMessagesProps {
  contactId: number;
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
  // create an instance of apolloclient
  const client = useApolloClient();

  const message = useQuery(NOTIFICATION);
  const [loadAllTags, AllTags] = useLazyQuery(GET_TAGS);
  const [editTagsMessageId, setEditTagsMessageId] = useState<number | null>(null);
  const [dialog, setDialogbox] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMessageTags, setSelectedMessageTags] = useState<any>(null);
  const [previousMessageTags, setPreviousMessageTags] = useState<any>(null);

  // Instantiate these to be used later.
  let receiverId: number = 0;
  let conversationIndex: number = -1;

  // create message mutation
  const [createAndSendMessage] = useMutation(CREATE_AND_SEND_MESSAGE_MUTATION);

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

  const allConversations: any = client.readQuery({
    query: GET_CONVERSATION_QUERY,
    variables: queryVariables,
  });

  const [getSearchQuery, { called, data, loading, error }] = useLazyQuery<any>(
    GET_CONVERSATION_MESSAGE_QUERY,
    {
      variables: {
        contactId: contactId ? contactId.toString() : '0',
        filter: {},
        messageOpts: {
          limit: 100,
        },
      },
    }
  );

  // tagging message mutation
  const [createMessageTag] = useMutation(CREATE_MESSAGE_TAGS, {
    onCompleted: (data) => {
      setEditTagsMessageId(null);
      setSearch('');
      setNotification(client, 'Tags added succesfully');
      setDialogbox(false);
    },
    update: (cache, { data }) => {
      const allConversations: any = client.readQuery({
        query: GET_CONVERSATION_QUERY,
        variables: queryVariables,
      });
      const messagesCopy = JSON.parse(JSON.stringify(allConversations));

      if (data.createMessageTags.messageTags) {
        const tags = data.createMessageTags.messageTags.map((tags: any) => tags.tag);
        messagesCopy.conversations[conversationIndex].messages = messagesCopy.conversations[
          conversationIndex
        ].messages.map((message: any) => {
          if (message.id === data.createMessageTags.messageTags[0].message.id) {
            message.tags = [...message.tags, ...tags];
          }
          return message;
        });

        cache.writeQuery({
          query: GET_CONVERSATION_QUERY,
          variables: queryVariables,
          data: messagesCopy,
        });
      }
    },
  });

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

      createAndSendMessage({
        variables: { input: payload },
        // optimisticResponse: {
        //   __typename: 'Mutation',
        //   createMessage: {
        //     __typename: 'Message',
        //     id: Math.random().toString(36).substr(2, 9),
        //     body: body,
        //     senderId: 1,
        //     receiverId: receiverId,
        //     flow: 'OUTBOUND',
        //     type: 'TEXT',
        //   },
        // },
        // update: (cache, { data }) => {
        //   const messagesCopy = JSON.parse(JSON.stringify(allConversations));
        //   if (data.createAndSendMessage) {
        //     // add new message to messages array
        //     messagesCopy.conversations[conversationIndex].messages.unshift(
        //       data.createAndSendMessage.message
        //     );

        //     // update the cache
        //     cache.writeQuery({
        //       query: GET_CONVERSATION_QUERY,
        //       variables: queryVariables,
        //       data: messagesCopy,
        //     });
        //   }
        // },
      });
    },
    [createAndSendMessage, queryVariables, receiverId, allConversations, conversationIndex]
  );

  // HOOKS ESTABLISHED ABOVE

  // Run through these cases to ensure data always exists
  if (called && loading) {
    return <Loading />;
  }
  if (called && error) {
    return <p>Error :(</p>;
  }

  // use contact id to filter if it is passed via url, else use the first conversation
  let conversationInfo: any = [];

  if (contactId) {
    // loop through the cached conversations and find if contact exists
    allConversations.conversations.map((conversation: any, index: any) => {
      if (conversation.contact.id === contactId) {
        conversationIndex = index;
        conversationInfo = conversation;
      }
    });

    // this means we didn't find the contact in the cached converation,
    // time to get the conversation for this contact from server and then
    // store it in the cached object too.
    if (conversationIndex < 0) {
      if (!called) {
        getSearchQuery();
        return <Loading />;
      }
      conversationIndex = 0;
      conversationInfo = data.conversation;

      // TODO: Find a way to add the conversation to the end of the conversationList in order to cache this as well.
      // allConversations.conversations.splice(0, 0, data.conversation);
      // allConversations.conversations.unshift(data.conversation);
    }
  }

  // By default, have conversationInfo be the first thing if there is no contactId;
  if (conversationInfo.length === 0) {
    conversationIndex = 0;
    conversationInfo = allConversations.conversations[conversationIndex];
  }

  receiverId = conversationInfo.contact.id;

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
    setEditTagsMessageId(null);
    setSearch('');
  };

  const handleSubmit = () => {
    // const tagsForm = document.getElementById('tagsForm');
    // let messageTags: any = tagsForm?.querySelectorAll('input[type="checkbox"]');
    // messageTags = [].slice.call(messageTags);
    // const selectedTags = messageTags.filter((tag: any) => tag.checked).map((tag: any) => tag.name);

    const selectedTags = selectedMessageTags.filter(
      (tag: any) => !previousMessageTags.includes(tag)
    );

    if (selectedTags.length === 0) {
      setDialogbox(false);
      setEditTagsMessageId(null);
    } else {
      createMessageTag({
        variables: {
          input: {
            messageId: editTagsMessageId,
            tagsId: selectedTags,
          },
        },
      });
    }
  };

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
                            (messageTag: any) => messageTag !== event?.target.name
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
            setPreviousMessageTags(messageTagId);
            setDialogbox(!dialog);
          }}
          focus={index === 0}
          showMessage={
            index !== 0
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
