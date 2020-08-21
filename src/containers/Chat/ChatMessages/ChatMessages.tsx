import React, { useCallback, useState, useEffect } from 'react';
import { useQuery, useMutation, useLazyQuery, useApolloClient } from '@apollo/client';
import {
  Container,
  InputLabel,
  OutlinedInput,
  Chip,
  SvgIcon,
  FormControl,
  TextField,
  InputAdornment,
  Popper,
  Paper,
} from '@material-ui/core';
import moment from 'moment';
import AutoComplete from '@material-ui/lab/Autocomplete';

import { ReactComponent as DeleteIcon } from '../../../assets/images/icons/Close.svg';
import { ReactComponent as TagIcon } from '../../../assets/images/icons/Tags/Selected.svg';

import { DialogBox } from '../../../components/UI/DialogBox/DialogBox';
import { setNotification, setErrorMessage } from '../../../common/notification';
import { ContactBar } from './ContactBar/ContactBar';
import { ChatMessage } from './ChatMessage/ChatMessage';
import { ChatInput } from './ChatInput/ChatInput';
import styles from './ChatMessages.module.css';
import { ToastMessage } from '../../../components/UI/ToastMessage/ToastMessage';
import { TIME_FORMAT } from '../../../common/constants';
import { NOTIFICATION } from '../../../graphql/queries/Notification';
import { SEARCH_QUERY } from '../../../graphql/queries/Search';
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
  const [selectedMessageTags, setSelectedMessageTags] = useState<any>(null);
  const [previousMessageTags, setPreviousMessageTags] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState<any>(null);
  const [reducedHeight, setReducedHeight] = useState(0);

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
      limit: 50,
    },
  };

  const {
    loading: conversationLoad,
    error: conversationError,
    data: allConversations,
  }: any = useQuery(SEARCH_QUERY, {
    variables: queryVariables,
    fetchPolicy: 'cache-first',
  });

  const [getSearchQuery, { called, data, loading, error }] = useLazyQuery<any>(SEARCH_QUERY, {
    variables: {
      contactOpts: {
        limit: 50,
      },
      filter: { id: contactId ? contactId.toString() : '0' },
      messageOpts: {
        limit: 50,
      },
    },
  });

  let unselectedTags: Array<any> = [];

  // tagging message mutation
  const [createMessageTag] = useMutation(UPDATE_MESSAGE_TAGS, {
    onCompleted: (data) => {
      setNotification(client, 'Tags added succesfully');
      setDialogbox(false);
    },
    update: (cache, { data }) => {
      const allConversations: any = client.readQuery({
        query: SEARCH_QUERY,
        variables: queryVariables,
      });

      const messagesCopy = JSON.parse(JSON.stringify(allConversations));
      if (data.updateMessageTags.messageTags) {
        const addedTags = data.updateMessageTags.messageTags.map((tags: any) => tags.tag);
        messagesCopy.search[conversationIndex].messages = messagesCopy.search[
          conversationIndex
        ].messages.map((message: any) => {
          if (message.id === editTagsMessageId) {
            message.tags = message.tags.filter((tag: any) => !unselectedTags.includes(tag.id));
            message.tags = [...message.tags, ...addedTags];
          }
          return message;
        });

        cache.writeQuery({
          query: SEARCH_QUERY,
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
  if ((called && loading) || conversationLoad) {
    return <Loading />;
  }

  if (called && error) {
    setErrorMessage(client, error);
    return null;
  }

  if (conversationError) {
    setErrorMessage(client, conversationError);
    return null;
  }

  // use contact id to filter if it is passed via url, else use the first conversation
  let conversationInfo: any = [];

  if (contactId) {
    // loop through the cached conversations and find if contact exists
    if (allConversations && allConversations.search)
      allConversations.search.map((conversation: any, index: any) => {
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
      conversationInfo = data ? data.search[0] : null;

      // TODO: Find a way to add the conversation to the end of the conversationList in order to cache this as well.
      // allConversations.conversations.splice(0, 0, data.conversation);
      // allConversations.conversations.unshift(data.conversation);
    }
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

  const tags = AllTags.data ? AllTags.data.tags : [];

  if (dialog) {
    const tagIcon = <TagIcon className={styles.TagIcon} />;

    dialogBox = (
      <DialogBox
        title="Assign tag to message"
        handleCancel={closeDialogBox}
        handleOk={handleSubmit}
        buttonOk="Save"
      >
        <div className={styles.DialogBox}>
          <FormControl fullWidth>
            <AutoComplete
              PaperComponent={({ className, ...props }) => (
                <Paper className={`${styles.Paper} ${className}`} {...props}></Paper>
              )}
              value={tags.filter((tag: any) => selectedMessageTags.includes(tag.id.toString()))}
              renderTags={(value: any, getTagProps) =>
                value.map((option: any, index: number) => (
                  <Chip
                    style={{ backgroundColor: '#e2f1ea', color: '#073F24', fontSize: '16px' }}
                    icon={tagIcon}
                    label={option.label}
                    {...getTagProps({ index })}
                    deleteIcon={
                      <DeleteIcon className={styles.DeleteIcon} data-testid="deleteIcon" />
                    }
                  />
                ))
              }
              multiple
              freeSolo
              onChange={(event, value: any) => {
                setSelectedMessageTags(value.map((tag: any) => tag.id));
              }}
              options={AllTags.data ? AllTags.data.tags : []}
              getOptionLabel={(option: any) => option.label}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  data-testid="dialogInput"
                  label="Search"
                />
              )}
            ></AutoComplete>
          </FormControl>
        </div>
      </DialogBox>
    );
  }

  const showEditTagsDialog = (id: number) => {
    setEditTagsMessageId(id);
    setShowDropdown(id);
  };

  let messageList: any;
  if (conversationInfo && conversationInfo.messages && conversationInfo.messages.length > 0) {
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

    messageList = reverseConversation
      .sort((currentMessage: any, nextMessage: any) => {
        return currentMessage.id - nextMessage.id;
      })
      .reverse();
  }

  let messageListContainer;
  // Check if there are conversation messages else display no messages
  if (messageList) {
    messageListContainer = (
      <Container
        className={styles.MessageList}
        style={{ height: `calc(100% - 175px - ${reducedHeight}px)` }}
        maxWidth={false}
        data-testid="messageContainer"
      >
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

  const handleHeightChange = (newHeight: number) => {
    setReducedHeight(newHeight);
  };

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
      <ChatInput handleHeightChange={handleHeightChange} onSendMessage={sendMessageHandler} />
    </Container>
  );
};

export default ChatMessages;
