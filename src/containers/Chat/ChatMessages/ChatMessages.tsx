import React, { useCallback, useState, useEffect } from 'react';
import { useQuery, useMutation, useLazyQuery, useApolloClient, ApolloError } from '@apollo/client';
import { Container } from '@material-ui/core';
import moment from 'moment';
import { Redirect } from 'react-router';

import styles from './ChatMessages.module.css';
import Loading from '../../../components/UI/Layout/Loading/Loading';
import { SearchDialogBox } from '../../../components/UI/SearchDialogBox/SearchDialogBox';
import { ToastMessage } from '../../../components/UI/ToastMessage/ToastMessage';
import { ContactBar } from './ContactBar/ContactBar';
import { ChatMessage } from './ChatMessage/ChatMessage';
import { ChatInput } from './ChatInput/ChatInput';
import { setNotification, setErrorMessage } from '../../../common/notification';
import { TIME_FORMAT, SEARCH_QUERY_VARIABLES } from '../../../common/constants';
import { NOTIFICATION } from '../../../graphql/queries/Notification';
import { SEARCH_QUERY } from '../../../graphql/queries/Search';
import {
  CREATE_AND_SEND_MESSAGE_MUTATION,
  UPDATE_MESSAGE_TAGS,
} from '../../../graphql/mutations/Chat';
import { FILTER_TAGS_NAME } from '../../../graphql/queries/Tag';
import { ReactComponent as TagIcon } from '../../../assets/images/icons/Tags/Selected.svg';

export interface ChatMessagesProps {
  contactId: number | string;
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
  const [loadAllTags, allTags] = useLazyQuery(FILTER_TAGS_NAME, {
    variables: {
      filter: {},
      opts: {
        order: 'ASC',
      },
    },
  });
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
  const [createAndSendMessage] = useMutation(CREATE_AND_SEND_MESSAGE_MUTATION, {
    onError: (error: ApolloError) => {
      setNotification(
        client,
        'Sorry! 24 hrs window closed. Your message cannot be sent at this time. ',
        'warning'
      );
      return null;
    },
  });

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
  const queryVariables = SEARCH_QUERY_VARIABLES;

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
    onCompleted: () => {
      setNotification(client, 'Tags added succesfully');
      setDialogbox(false);
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

  if (data && data.search[0].contact.status === 'BLOCKED') {
    return <Redirect to="/chat" />;
  }

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
    setNotification(client, null, null);
  };

  if (message.data && message.data.message) {
    toastMessage = (
      <ToastMessage
        message={message.data.message}
        severity={message.data.severity ? message.data.severity : ''}
        handleClose={closeToastMessage}
      />
    );
  }

  const closeDialogBox = () => {
    setDialogbox(false);
    setShowDropdown(null);
  };

  const handleSubmit = (selectedMessageTags: any) => {
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

  const tags = allTags.data ? allTags.data.tags : [];

  if (dialog) {
    dialogBox = (
      <SearchDialogBox
        selectedOptions={selectedMessageTags}
        title="Assign tag to message"
        handleOk={handleSubmit}
        handleCancel={closeDialogBox}
        options={tags}
        icon={<TagIcon />}
      ></SearchDialogBox>
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
        contactId={contactId.toString()}
        lastMessageTime={conversationInfo.contact.lastMessageAt}
        contactStatus={conversationInfo.contact.status}
      />
      {messageListContainer}
      <ChatInput
        handleHeightChange={handleHeightChange}
        onSendMessage={sendMessageHandler}
        contactStatus={conversationInfo.contact.status}
        contactProviderStatus={conversationInfo.contact.providerStatus}
      />
    </Container>
  );
};

export default ChatMessages;
