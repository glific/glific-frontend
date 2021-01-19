import React, { useCallback, useState, useEffect } from 'react';
import { useQuery, useMutation, useLazyQuery, useApolloClient } from '@apollo/client';
import { CircularProgress, Container } from '@material-ui/core';
import moment from 'moment';
import { Redirect } from 'react-router-dom';

import styles from './ChatMessages.module.css';
import { SearchDialogBox } from '../../../components/UI/SearchDialogBox/SearchDialogBox';
import { ContactBar } from './ContactBar/ContactBar';
import { ChatMessage } from './ChatMessage/ChatMessage';
import { ChatInput } from './ChatInput/ChatInput';
import { setNotification, setErrorMessage } from '../../../common/notification';
import { TIME_FORMAT, SEARCH_QUERY_VARIABLES, setVariables } from '../../../common/constants';
import { SEARCH_QUERY } from '../../../graphql/queries/Search';
import {
  CREATE_AND_SEND_MESSAGE_MUTATION,
  CREATE_AND_SEND_MESSAGE_TO_GROUP_MUTATION,
  UPDATE_MESSAGE_TAGS,
} from '../../../graphql/mutations/Chat';
import { FILTER_TAGS_NAME } from '../../../graphql/queries/Tag';
import { ReactComponent as TagIcon } from '../../../assets/images/icons/Tags/Selected.svg';
import { getCachedConverations, updateConversationsCache } from '../../../services/ChatService';

export interface ChatMessagesProps {
  contactId?: number | string | null;
  simulatorId?: string | null;
  groupId?: number | string | null;
}

export const ChatMessages: React.SFC<ChatMessagesProps> = ({ contactId, simulatorId, groupId }) => {
  // create an instance of apolloclient
  const client = useApolloClient();
  const [loadAllTags, allTags] = useLazyQuery(FILTER_TAGS_NAME, {
    variables: setVariables(),
  });
  const [editTagsMessageId, setEditTagsMessageId] = useState<number | null>(null);
  const [dialog, setDialogbox] = useState(false);
  const [selectedMessageTags, setSelectedMessageTags] = useState<any>(null);
  const [previousMessageTags, setPreviousMessageTags] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState<any>(null);
  const [reducedHeight, setReducedHeight] = useState(0);
  const [lastScrollHeight, setLastScrollHeight] = useState(0);
  const [messageOffset, setMessageOffset] = useState(50);
  const [showLoadMore, setShowLoadMore] = useState(true);

  useEffect(() => {
    setShowLoadMore(true);
  }, [contactId]);

  // Instantiate these to be used later.

  let conversationIndex: number = -1;

  // create message mutation
  const [createAndSendMessage] = useMutation(CREATE_AND_SEND_MESSAGE_MUTATION, {
    onError: () => {
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

  // get the conversations stored from the cache
  const queryVariables = SEARCH_QUERY_VARIABLES;

  if (groupId) {
    queryVariables.filter = { searchGroup: true };
  } else {
    queryVariables.filter = {};
  }

  const {
    loading: conversationLoad,
    error: conversationError,
    data: allConversations,
  }: any = useQuery(SEARCH_QUERY, {
    variables: queryVariables,
    fetchPolicy: 'cache-only',
  });

  const [getSearchQuery, { called, data, loading, error }] = useLazyQuery<any>(SEARCH_QUERY, {
    onCompleted: (searchData) => {
      if (searchData) {
        if (searchData.search[0].messages.length === 0) {
          setShowLoadMore(false);
        } else {
          // get the conversations from cache
          const conversations = getCachedConverations(client, queryVariables);

          const conversationCopy = JSON.parse(JSON.stringify(searchData));
          conversationCopy.search[0].messages
            .sort((currentMessage: any, nextMessage: any) => {
              return currentMessage.id - nextMessage.id;
            })
            .reverse();
          const conversationsCopy = JSON.parse(JSON.stringify(conversations));
          let isContactCached = false;
          conversationsCopy.search = conversationsCopy.search.map((conversation: any) => {
            const conversationObj = conversation;
            // If the contact is present in the cache
            if (conversationObj.contact.id === contactId?.toString()) {
              isContactCached = true;
              conversationObj.messages = [
                ...conversationObj.messages,
                ...conversationCopy.search[0].messages,
              ];
            }
            return conversationObj;
          });
          // If the contact is NOT present in the cache
          if (!isContactCached) {
            conversationsCopy.search = [...conversationsCopy.search, searchData.search[0]];
          }
          // update the conversation cache
          updateConversationsCache(conversationsCopy, client, queryVariables);

          setMessageOffset(messageOffset + 50);
        }
      }
    },
  });
  let messageList: any;

  useEffect(() => {
    const messageContainer: any = document.querySelector('.messageContainer');
    if (messageContainer) {
      messageContainer.scrollTop += messageContainer.scrollHeight - lastScrollHeight;
    }
  }, [allConversations, lastScrollHeight]);

  let unselectedTags: Array<any> = [];

  // tagging message mutation
  const [createMessageTag] = useMutation(UPDATE_MESSAGE_TAGS, {
    onCompleted: () => {
      setNotification(client, 'Tags added successfully');
      setDialogbox(false);
    },
  });

  const [sendMessageToGroups] = useMutation(CREATE_AND_SEND_MESSAGE_TO_GROUP_MUTATION);

  // this function is called when the message is sent
  const sendGroupMessageHandler = (
    body: string,
    mediaId: string,
    messageType: string,
    selectedTemplate: any,
    variableParam: any
  ) => {
    const payload: any = {
      body,
      senderId: 1,
      mediaId,
      type: messageType,
      flow: 'OUTBOUND',
    };

    // add additional param for template
    if (selectedTemplate) {
      payload.isHsm = selectedTemplate.isHsm;
      payload.templateId = parseInt(selectedTemplate.id, 10);
      payload.params = variableParam;
    }

    sendMessageToGroups({
      variables: { groupId, input: payload },
    });
  };

  // this function is called when the message is sent
  const sendMessageHandler = useCallback(
    (
      body: string,
      mediaId: string,
      messageType: string,
      selectedTemplate: any,
      variableParam: any
    ) => {
      const payload: any = {
        body,
        senderId: 1,
        mediaId,
        receiverId: contactId,
        type: messageType,
        flow: 'OUTBOUND',
      };

      // add additional param for template
      if (selectedTemplate) {
        payload.isHsm = selectedTemplate.isHsm;
        payload.templateId = parseInt(selectedTemplate.id, 10);
        payload.params = variableParam;
      }

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

  if (called && error) {
    setErrorMessage(client, error);
    return null;
  }

  if (conversationError) {
    setErrorMessage(client, conversationError);
    return null;
  }

  // use contact id to filter if it is passed via url, else use the first conversation
  let conversationInfo: any = {};

  if (contactId) {
    // loop through the cached conversations and find if contact exists
    if (allConversations && allConversations.search)
      allConversations.search.map((conversation: any, index: any) => {
        if (conversation.contact.id === contactId.toString()) {
          conversationIndex = index;
          conversationInfo = conversation;
        }
        return null;
      });

    // if conversation is not present then fetch for contact
    if (conversationIndex < 0) {
      if (!loading && !data) {
        getSearchQuery({
          variables: {
            filter: { id: contactId },
            messageOpts: { limit: 50, offset: 0 },
            contactOpts: { limit: 50 },
          },
        });
      }
    }
  }

  if (groupId) {
    // loop through the cached conversations and find if contact exists
    if (allConversations && allConversations.search) {
      if (groupId === -1) {
        conversationIndex = 0;
        [conversationInfo] = allConversations.search;
      } else {
        allConversations.search.map((conversation: any, index: any) => {
          if (conversation.group.id === groupId.toString()) {
            conversationIndex = index;
            conversationInfo = conversation;
          }
          return null;
        });
      }
    }

    // if conversation is not present then fetch for contact
    if (conversationIndex < 0) {
      if (!loading && !data) {
        getSearchQuery({
          variables: {
            // filter: { id: groupId },
            messageOpts: { limit: 50, offset: 0 },
            contactOpts: { limit: 50 },
          },
        });
      }
    }
  }

  const closeDialogBox = () => {
    setDialogbox(false);
    setShowDropdown(null);
  };

  const handleSubmit = (tags: any) => {
    const selectedTags = tags.filter((tag: any) => !previousMessageTags.includes(tag));
    unselectedTags = previousMessageTags.filter((tag: any) => !tags.includes(tag));

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
      />
    );
  }

  const showEditTagsDialog = (id: number) => {
    setEditTagsMessageId(id);
    setShowDropdown(id);
  };

  if (conversationInfo && conversationInfo.messages && conversationInfo.messages.length > 0) {
    let reverseConversation = [...conversationInfo.messages];
    reverseConversation = reverseConversation.map((message: any, index: number) => {
      const key = index;
      return (
        <ChatMessage
          {...message}
          contactId={contactId}
          key={key}
          popup={message.id === showDropdown}
          onClick={() => showEditTagsDialog(message.id)}
          setDialog={() => {
            loadAllTags();

            let messageTags = conversationInfo.messages.filter(
              (messageObj: any) => messageObj.id === editTagsMessageId
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

  const loadMoreMessages = () => {
    getSearchQuery({
      variables: {
        filter: { id: contactId?.toString() },
        messageOpts: { limit: 50, offset: messageOffset },
        contactOpts: { limit: 1 },
      },
    });
    const messageContainer = document.querySelector('.messageContainer');
    if (messageContainer) {
      setLastScrollHeight(messageContainer.scrollHeight);
    }
  };

  let messageListContainer;
  // Check if there are conversation messages else display no messages
  if (messageList) {
    messageListContainer = (
      <Container
        className={`${styles.MessageList} messageContainer `}
        style={{ height: `calc(100% - 195px - ${reducedHeight}px)` }}
        maxWidth={false}
        data-testid="messageContainer"
      >
        {showLoadMore && conversationInfo.messages.length > 49 ? (
          <div className={styles.LoadMore}>
            {(called && loading) || conversationLoad ? (
              <CircularProgress className={styles.Loading} />
            ) : (
              <div
                className={styles.LoadMoreButton}
                onClick={loadMoreMessages}
                onKeyDown={loadMoreMessages}
                aria-hidden="true"
              >
                Load more messages
              </div>
            )}
          </div>
        ) : null}
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

  const handleChatClearedAction = () => {
    const conversationInfoCopy = JSON.parse(JSON.stringify(conversationInfo));
    conversationInfoCopy.messages = [];
    let allConversationsCopy: any = [];
    allConversationsCopy = JSON.parse(JSON.stringify(allConversations));
    allConversationsCopy.search[conversationIndex] = conversationInfoCopy;

    // update allConversations in the cache
    updateConversationsCache(allConversationsCopy, client, queryVariables);
  };

  // conversationInfo should not be empty
  if (!Object.prototype.hasOwnProperty.call(conversationInfo, 'contact')) {
    return (
      <div className={styles.LoadMore}>
        <CircularProgress className={styles.Loading} />
      </div>
    );
  }

  let topChatBar;
  let chatInputSection;
  if (contactId) {
    topChatBar = (
      <ContactBar
        displayName={
          conversationInfo.contact.name
            ? conversationInfo.contact.name
            : conversationInfo.contact.maskedPhone
        }
        isSimulator={contactId === simulatorId}
        contactId={contactId.toString()}
        lastMessageTime={conversationInfo.contact.lastMessageAt}
        contactStatus={conversationInfo.contact.status}
        contactBspStatus={conversationInfo.contact.bspStatus}
        handleAction={handleChatClearedAction}
      />
    );

    chatInputSection = (
      <ChatInput
        handleHeightChange={handleHeightChange}
        onSendMessage={sendMessageHandler}
        lastMessageTime={conversationInfo.contact.lastMessageAt}
        contactStatus={conversationInfo.contact.status}
        contactBspStatus={conversationInfo.contact.bspStatus}
      />
    );
  } else if (groupId) {
    topChatBar = (
      <ContactBar
        groupId={groupId.toString()}
        displayName={conversationInfo.group.label}
        handleAction={handleChatClearedAction}
      />
    );

    chatInputSection = (
      <ChatInput handleHeightChange={handleHeightChange} onSendMessage={sendGroupMessageHandler} />
    );
  }

  return (
    <Container className={styles.ChatMessages} maxWidth={false} disableGutters>
      {dialogBox}
      {topChatBar}
      {messageListContainer}
      {chatInputSection}
    </Container>
  );
};

export default ChatMessages;
