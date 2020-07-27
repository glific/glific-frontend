import React, { useCallback, useState, useEffect } from 'react';
import { useQuery, useMutation, useLazyQuery, useApolloClient } from '@apollo/client';
import {
  Container,
  InputLabel,
  OutlinedInput,
  Chip,
  SvgIcon,
  FormControl,
  InputAdornment,
} from '@material-ui/core';
import moment from 'moment';

import { ReactComponent as SelectIcon } from '../../../assets/images/icons/Select.svg';
import { ReactComponent as SearchIcon } from '../../../assets/images/icons/Search/Desktop.svg';

import { DialogBox } from '../../../components/UI/DialogBox/DialogBox';
import { setNotification, setErrorMessage } from '../../../common/notification';
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
  UPDATE_MESSAGE_TAGS,
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
  const [showDropdown, setShowDropdown] = useState<any>(null);

  // Instantiate these to be used later.

  let conversationIndex: number = -1;
  let toastMessage;

  // create message mutation
  const [createAndSendMessage] = useMutation(CREATE_AND_SEND_MESSAGE_MUTATION);

  useEffect(() => {
    if (editTagsMessageId) {
      window.addEventListener('click', () => setShowDropdown(null), true);
    }
  }, [editTagsMessageId]);

  useEffect(() => {
    return () => {
      setNotification(client, null);
    };
  }, [toastMessage, client]);

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

  let unselectedTags: Array<any> = [];

  // tagging message mutation
  const [createMessageTag] = useMutation(UPDATE_MESSAGE_TAGS, {
    onCompleted: (data) => {
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
      if (data.updateMessageTags.messageTags) {
        const addedTags = data.updateMessageTags.messageTags.map((tags: any) => tags.tag);
        messagesCopy.conversations[conversationIndex].messages = messagesCopy.conversations[
          conversationIndex
        ].messages.map((message: any) => {
          if (message.id === editTagsMessageId) {
            message.tags = message.tags.filter((tag: any) => !unselectedTags.includes(tag.id));
            message.tags = [...message.tags, ...addedTags];
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
        receiverId: contactId,
        type: 'TEXT',
        flow: 'OUTBOUND',
      };

      createAndSendMessage({
        variables: { input: payload },
      });
    },
    [createAndSendMessage, contactId]
  );

  // HOOKS ESTABLISHED ABOVE

  // Run through these cases to ensure data always exists
  if (called && loading) {
    return <Loading />;
  }
  if (called && error) {
    setErrorMessage(client, error);
    return null;
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
      return null;
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
  } else if (contactId && allConversations.conversations.length === 0) {
    // If there are no conversations (new user), then return that there are "No conversations"
    // Case with !contactId and convos length == 0 taken care of in Chat.tsx
    conversationInfo = null;
  }

  //toast
  const closeToastMessage = () => {
    setNotification(client, null);
  };

  if (message.data && message.data.message) {
    toastMessage = <ToastMessage message={message.data.message} handleClose={closeToastMessage} />;
  }

  const closeDialogBox = () => {
    setDialogbox(false);
    setShowDropdown(null);
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
    unselectedTags = previousMessageTags.filter((tag: any) => !selectedMessageTags.includes(tag));

    if (selectedTags.length === 0 && unselectedTags.length === 0) {
      setDialogbox(false);
      setShowDropdown(null);
    } else {
      createMessageTag({
        variables: {
          input: {
            messageId: editTagsMessageId,
            addTagIds: selectedTags,
            deleteTagIds: unselectedTags,
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
              <Chip
                label={tag.label}
                className={styles.Chip}
                key={tag.id}
                data-tagid={tag.id}
                clickable={true}
                icon={
                  selectedMessageTags?.includes(tag.id.toString()) ? (
                    <SvgIcon
                      component={SelectIcon}
                      viewBox="0 0 12 12"
                      className={styles.SelectIcon}
                    />
                  ) : undefined
                }
                onClick={(event: any) => {
                  const tagId = event.currentTarget.getAttribute('data-tagid');
                  if (selectedMessageTags?.includes(tagId.toString())) {
                    setSelectedMessageTags(
                      selectedMessageTags?.filter(
                        (messageTag: any) => messageTag !== tagId.toString()
                      )
                    );
                  } else {
                    setSelectedMessageTags([...selectedMessageTags, tagId.toString()]);
                  }
                }}
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
        buttonOk="Save"
      >
        <div className={styles.DialogBox}>
          <FormControl fullWidth>
            <InputLabel variant="outlined">Search</InputLabel>
            <OutlinedInput
              classes={{
                notchedOutline: styles.InputBorder,
              }}
              className={styles.Label}
              label="Search"
              fullWidth
              onChange={(event) => setSearch(event.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              }
            />
          </FormControl>
          <div>
            <form id="tagsForm" className={styles.Form}>
              {tagList}
            </form>
          </div>
        </div>
      </DialogBox>
    );
  }

  const showEditTagsDialog = (id: number) => {
    setEditTagsMessageId(id);
    setShowDropdown(id);
  };

  let messageList: any;
  if (conversationInfo && conversationInfo.messages.length > 0) {
    let reverseConversation = [...conversationInfo.messages];
    reverseConversation = reverseConversation.map((message: any, index: number) => {
      return (
        <ChatMessage
          {...message}
          contactId={contactId}
          key={index}
          popup={message.id === showDropdown}
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

  let messageListContainer;
  // Check if there are conversation messages else display no messages
  if (messageList) {
    messageListContainer = (
      <Container className={styles.MessageList} maxWidth={false} data-testid="messageContainer">
        {messageList}
      </Container>
    );
  } else {
    messageListContainer = (
      <div className={styles.NoMessages} data-testid="messageContainer">
        No messages.
      </div>
    );
  }

  return (
    <Container className={styles.ChatMessages} maxWidth={false} disableGutters>
      {dialogBox}
      {toastMessage}
      <ContactBar
        contactName={
          conversationInfo.contact.name
            ? conversationInfo.contact.name
            : conversationInfo.contact.phone
        }
      />
      {messageListContainer}
      <ChatInput onSendMessage={sendMessageHandler} />
    </Container>
  );
};

export default ChatMessages;
