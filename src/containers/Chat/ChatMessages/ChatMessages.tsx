import React, { useCallback, useState, useEffect } from 'react';
import { useQuery, useMutation, useLazyQuery, useApolloClient } from '@apollo/client';
import { CircularProgress, Container } from '@material-ui/core';
import moment from 'moment';
import { Redirect } from 'react-router-dom';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import styles from './ChatMessages.module.css';
import { SearchDialogBox } from '../../../components/UI/SearchDialogBox/SearchDialogBox';
import { ContactBar } from './ContactBar/ContactBar';
import { ChatMessage } from './ChatMessage/ChatMessage';
import { ChatInput } from './ChatInput/ChatInput';
import { setNotification, setErrorMessage } from '../../../common/notification';
import {
  TIME_FORMAT,
  SEARCH_QUERY_VARIABLES,
  setVariables,
  COLLECTION_SEARCH_QUERY_VARIABLES,
  DEFAULT_MESSAGE_LIMIT,
  DEFAULT_CONTACT_LIMIT,
  DEFAULT_MESSAGE_LOADMORE_LIMIT,
  SIMULATOR_NUMBER_START,
} from '../../../common/constants';
import { SEARCH_QUERY } from '../../../graphql/queries/Search';
import {
  CREATE_AND_SEND_MESSAGE_MUTATION,
  CREATE_AND_SEND_MESSAGE_TO_COLLECTION_MUTATION,
  UPDATE_MESSAGE_TAGS,
} from '../../../graphql/mutations/Chat';
import { FILTER_TAGS_NAME } from '../../../graphql/queries/Tag';
import { ReactComponent as TagIcon } from '../../../assets/images/icons/Tags/Selected.svg';
import { getCachedConverations, updateConversationsCache } from '../../../services/ChatService';

export interface ChatMessagesProps {
  contactId?: number | string | null;
  collectionId?: number | string | null;
}

export const ChatMessages: React.SFC<ChatMessagesProps> = ({ contactId, collectionId }) => {
  // create an instance of apollo client
  const client = useApolloClient();
  const [loadAllTags, allTags] = useLazyQuery(FILTER_TAGS_NAME, {
    variables: setVariables(),
  });
  const urlString = new URL(window.location.href);

  let messageParameterOffset: any = 0;

  // get the message number from url
  if (urlString.searchParams.get('search')) {
    messageParameterOffset = urlString.searchParams.get('search');
    // check if the message number is greater than 10 otherwise set the initial offset to 0
    messageParameterOffset =
      messageParameterOffset && parseInt(messageParameterOffset, 10) - 10 < 0
        ? 1
        : parseInt(messageParameterOffset, 10) - 10;
  }

  const [editTagsMessageId, setEditTagsMessageId] = useState<number | null>(null);
  const [dialog, setDialogbox] = useState(false);
  const [selectedMessageTags, setSelectedMessageTags] = useState<any>(null);
  const [previousMessageTags, setPreviousMessageTags] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState<any>(null);
  const [reducedHeight, setReducedHeight] = useState(0);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [scrolledToMessage, setScrolledToMessage] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(true);
  const [defaultJumpToLatest, setDefaultShowJumpToLatest] = useState(true);
  const [conversationInfo, setConversationInfo] = useState<any>({});

  useEffect(() => {
    setShowLoadMore(true);
    setScrolledToMessage(false);
    setShowJumpToLatest(false);
    setDefaultShowJumpToLatest(true);
  }, [contactId]);

  useEffect(() => {
    const messageContainer: any = document.querySelector('.messageContainer');
    if (messageContainer) {
      messageContainer.addEventListener('scroll', (event: any) => {
        const messageContainerTarget = event.target;
        if (
          Math.round(messageContainerTarget.scrollTop) ===
          messageContainerTarget.scrollHeight - messageContainerTarget.offsetHeight
        ) {
          setShowJumpToLatest(false);
        } else if (showJumpToLatest === false) {
          setShowJumpToLatest(true);
        }
      });
    }
  }, [setShowJumpToLatest, contactId, reducedHeight]);

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
    const clickListener = () => setShowDropdown(null);
    if (editTagsMessageId) {
      // need to check why we are doing this
      window.addEventListener('click', clickListener, true);
    }
    return () => {
      window.removeEventListener('click', clickListener);
    };
  }, [editTagsMessageId]);

  // get the conversations stored from the cache
  let queryVariables = SEARCH_QUERY_VARIABLES;

  if (collectionId) {
    queryVariables = COLLECTION_SEARCH_QUERY_VARIABLES;
  }

  const {
    loading: conversationLoad,
    error: conversationError,
    data: allConversations,
  }: any = useQuery(SEARCH_QUERY, {
    variables: queryVariables,
    fetchPolicy: 'cache-only',
  });

  // scroll to the particular message after loading
  const getScrollToMessage = () => {
    if (!scrolledToMessage) {
      setTimeout(() => {
        const element = document.querySelector(`#search${urlString.searchParams.get('search')}`);
        if (element) {
          element.scrollIntoView();
        }
        setScrolledToMessage(true);
      }, 1000);
    }
  };
  /* istanbul ignore next */
  const [
    getSearchParameterQuery,
    { called: parameterCalled, data: parameterdata, loading: parameterLoading },
  ] = useLazyQuery<any>(SEARCH_QUERY, {
    onCompleted: (searchData) => {
      if (searchData && searchData.search.length > 0) {
        // get the conversations from cache
        const conversations = getCachedConverations(client, queryVariables);

        const conversationCopy = JSON.parse(JSON.stringify(searchData));
        conversationCopy.search[0].messages
          .sort((currentMessage: any, nextMessage: any) => currentMessage.id - nextMessage.id)
          .reverse();
        const conversationsCopy = JSON.parse(JSON.stringify(conversations));

        conversationsCopy.search = conversationsCopy.search.map((conversation: any) => {
          const conversationObj = conversation;
          if (collectionId) {
            // If the collection(group) is present in the cache
            if (conversationObj.group?.id === collectionId.toString()) {
              conversationObj.messages = conversationCopy.search[0].messages;
            }
            // If the contact is present in the cache
          } else if (conversationObj.contact?.id === contactId?.toString()) {
            conversationObj.messages = conversationCopy.search[0].messages;
          }
          return conversationObj;
        });

        // update the conversation cache
        updateConversationsCache(conversationsCopy, client, queryVariables);

        getScrollToMessage();

        // need to display Load more messages button
        setShowLoadMore(true);
      }
    },
  });
  /* istanbul ignore next */
  const [getSearchQuery, { called, data, loading, error }] = useLazyQuery<any>(SEARCH_QUERY, {
    onCompleted: (searchData) => {
      if (searchData && searchData.search.length > 0) {
        // get the conversations from cache
        const conversations = getCachedConverations(client, queryVariables);

        const conversationCopy = JSON.parse(JSON.stringify(searchData));
        conversationCopy.search[0].messages
          .sort((currentMessage: any, nextMessage: any) => currentMessage.id - nextMessage.id)
          .reverse();
        const conversationsCopy = JSON.parse(JSON.stringify(conversations));
        let isContactCached = false;
        conversationsCopy.search = conversationsCopy.search.map((conversation: any) => {
          const conversationObj = conversation;
          // If the collection(group) is present in the cache
          if (collectionId) {
            /* istanbul ignore next */
            if (conversationObj.group?.id === collectionId.toString()) {
              isContactCached = true;
              conversationObj.messages = [
                ...conversationObj.messages,
                ...conversationCopy.search[0].messages,
              ];
            }
          }
          // If the contact is present in the cache
          else if (conversationObj.contact?.id === contactId?.toString()) {
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

        if (searchData.search[0].messages.length === 0) {
          setShowLoadMore(false);
        }

        getScrollToMessage();
      }
    },
  });

  let messageList: any;
  let unselectedTags: Array<any> = [];

  // tagging message mutation
  const [createMessageTag] = useMutation(UPDATE_MESSAGE_TAGS, {
    onCompleted: () => {
      setNotification(client, 'Tags added successfully');
      setDialogbox(false);
    },
  });

  const [sendMessageToCollection] = useMutation(CREATE_AND_SEND_MESSAGE_TO_COLLECTION_MUTATION, {
    refetchQueries: [{ query: SEARCH_QUERY, variables: SEARCH_QUERY_VARIABLES }],
  });

  const updatePayload = (payload: any, selectedTemplate: any, variableParam: any) => {
    const payloadCopy = payload;
    // add additional param for template
    if (selectedTemplate) {
      payloadCopy.isHsm = selectedTemplate.isHsm;
      payloadCopy.templateId = parseInt(selectedTemplate.id, 10);
      payloadCopy.params = variableParam;
    }
    return payloadCopy;
  };

  // this function is called when the message is sent collection
  const sendCollectionMessageHandler = (
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

    sendMessageToCollection({
      variables: {
        groupId: collectionId,
        input: updatePayload(payload, selectedTemplate, variableParam),
      },
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

      createAndSendMessage({
        variables: { input: updatePayload(payload, selectedTemplate, variableParam) },
      });
    },
    [createAndSendMessage, contactId]
  );

  // HOOKS ESTABLISHED ABOVE

  // check if the search API results nothing for a particular contact ID and redirect to chat
  if (contactId && data) {
    if (data.search.length === 0 || data.search[0].contact.status === 'BLOCKED') {
      return <Redirect to="/chat" />;
    }
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

  // loop through the cached conversations and find if contact/Collection exists
  const updateConversationInfo = (type: string, Id: any) => {
    allConversations.search.map((conversation: any, index: any) => {
      if (conversation[type].id === Id.toString()) {
        conversationIndex = index;
        setConversationInfo(conversation);
      }
      return null;
    });
  };

  const findContactInAllConversations = () => {
    if (allConversations && allConversations.search) {
      // loop through the cached conversations and find if contact exists
      updateConversationInfo('contact', contactId);
    }

    // if conversation is not present then fetch for contact
    if (conversationIndex < 0) {
      if ((!loading && !called) || (data && data.search[0].contact.id !== contactId)) {
        getSearchQuery({
          variables: {
            filter: { id: contactId },
            contactOpts: { limit: 1 },
            messageOpts: {
              limit: DEFAULT_MESSAGE_LIMIT,
              offset: messageParameterOffset,
            },
          },
        });
      }
      // lets not get from cache if parameter is present
    } else if (conversationIndex > -1 && messageParameterOffset) {
      if (
        (!parameterLoading && !parameterCalled) ||
        (parameterdata && parameterdata.search[0].contact.id !== contactId)
      ) {
        getSearchParameterQuery({
          variables: {
            filter: { id: contactId },
            contactOpts: { limit: 1 },
            messageOpts: {
              limit: DEFAULT_MESSAGE_LIMIT,
              offset: messageParameterOffset,
            },
          },
        });
      }
    }
  };

  const findCollectionInAllConversations = () => {
    // loop through the cached conversations and find if collection exists
    if (allConversations && allConversations.search) {
      if (collectionId === -1) {
        conversationIndex = 0;
        setConversationInfo(allConversations.search);
      } else {
        updateConversationInfo('group', collectionId);
      }
    }

    // if conversation is not present then fetch the collection
    if (conversationIndex < 0) {
      if (!loading && !data) {
        getSearchQuery({
          variables: {
            filter: { id: collectionId, searchGroup: true },
            contactOpts: { limit: DEFAULT_CONTACT_LIMIT },
            messageOpts: { limit: DEFAULT_MESSAGE_LIMIT, offset: 0 },
          },
        });
      }
    }
  };

  // find if contact/Collection present in the cached
  useEffect(() => {
    if (contactId) {
      findContactInAllConversations();
    } else if (collectionId) {
      findCollectionInAllConversations();
    }
  }, [contactId, collectionId, allConversations]);

  const closeDialogBox = () => {
    setDialogbox(false);
    setShowDropdown(null);
  };
  /* istanbul ignore next */
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
            const messageTagId = messageTags.map((tag: any) => tag.id);
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
      .sort((currentMessage: any, nextMessage: any) => currentMessage.id - nextMessage.id)
      .reverse();
  }

  const loadMoreMessages = () => {
    const { messageNumber } = conversationInfo.messages[conversationInfo.messages.length - 1];
    const variables: any = {
      filter: { id: contactId?.toString() },
      contactOpts: { limit: 1 },
      messageOpts: {
        limit:
          messageNumber > DEFAULT_MESSAGE_LOADMORE_LIMIT
            ? DEFAULT_MESSAGE_LOADMORE_LIMIT - 1
            : messageNumber - 2,
        offset:
          messageNumber - DEFAULT_MESSAGE_LOADMORE_LIMIT <= 0
            ? 1
            : messageNumber - DEFAULT_MESSAGE_LOADMORE_LIMIT,
      },
    };

    if (collectionId) {
      variables.filter = { id: collectionId.toString(), searchGroup: true };
    }

    getSearchQuery({
      variables,
    });

    // keep scroll at last message
    const element = document.querySelector(`#search${messageNumber}`);
    if (element) {
      element.scrollIntoView();
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
        {showLoadMore && conversationInfo.messages.length > DEFAULT_MESSAGE_LIMIT - 1 ? (
          <div className={styles.LoadMore}>
            {(called && loading) || conversationLoad ? (
              <CircularProgress className={styles.Loading} />
            ) : (
              <div
                className={styles.LoadMoreButton}
                onClick={loadMoreMessages}
                onKeyDown={loadMoreMessages}
                aria-hidden="true"
                data-testid="loadMoreMessages"
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
        isSimulator={conversationInfo.contact.phone.startsWith(SIMULATOR_NUMBER_START)}
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
  } else if (collectionId) {
    topChatBar = (
      <ContactBar
        collectionId={collectionId.toString()}
        displayName={conversationInfo.group.label}
        handleAction={handleChatClearedAction}
      />
    );

    chatInputSection = (
      <ChatInput
        handleHeightChange={handleHeightChange}
        onSendMessage={sendCollectionMessageHandler}
      />
    );
  }

  const showLatestMessage = () => {
    setShowJumpToLatest(false);
    setDefaultShowJumpToLatest(false);

    // check if we have offset 0 (messageNumber === offset)
    if (conversationInfo.messages[0].messageNumber !== 0) {
      // set limit upto current message number
      const limit =
        conversationInfo.messages[conversationInfo.messages.length - 1].messageNumber + 20;

      // set variable for contact chats
      const variables: any = {
        contactOpts: { limit: 1 },
        filter: { id: contactId?.toString() },
        messageOpts: { limit, offset: 0 },
      };

      // if collection, replace id with collection id
      if (collectionId) {
        variables.filter = { id: collectionId.toString(), searchGroup: true };
      }

      getSearchParameterQuery({
        variables,
      });
    }

    const container: any = document.querySelector('.messageContainer');
    if (container) {
      container.scrollTop = container.scrollHeight - container.clientHeight;
    }
  };

  const jumpToLatest = (
    <div
      data-testid="jumpToLatest"
      className={styles.JumpToLatest}
      onClick={() => showLatestMessage()}
      onKeyDown={() => showLatestMessage()}
      aria-hidden="true"
    >
      Jump to latest
      <ExpandMoreIcon />
    </div>
  );

  return (
    <Container className={styles.ChatMessages} maxWidth={false} disableGutters>
      {dialogBox}
      {topChatBar}
      {messageListContainer}
      {conversationInfo.messages.length && (showJumpToLatest || defaultJumpToLatest)
        ? jumpToLatest
        : null}
      {chatInputSection}
    </Container>
  );
};

export default ChatMessages;
