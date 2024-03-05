import { useCallback, useState, useEffect } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { CircularProgress, Container } from '@mui/material';
import dayjs from 'dayjs';
import { Navigate, useLocation } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

import styles from './ChatMessages.module.css';
import { ContactBar } from './ContactBar/ContactBar';
import { ChatMessage } from './ChatMessage/ChatMessage';
import { ChatInput } from './ChatInput/ChatInput';
import StatusBar from './StatusBar/StatusBar';
import { setNotification, setErrorMessage } from '../../../common/notification';
import {
  SEARCH_QUERY_VARIABLES,
  COLLECTION_SEARCH_QUERY_VARIABLES,
  DEFAULT_MESSAGE_LIMIT,
  DEFAULT_ENTITY_LIMIT,
  DEFAULT_MESSAGE_LOADMORE_LIMIT,
  ISO_DATE_FORMAT,
  GROUP_QUERY_VARIABLES,
} from '../../../common/constants';
import { SEARCH_QUERY } from '../../../graphql/queries/Search';
import {
  CREATE_AND_SEND_MESSAGE_MUTATION,
  CREATE_AND_SEND_MESSAGE_TO_COLLECTION_MUTATION,
} from '../../../graphql/mutations/Chat';
import { getCachedConverations, updateConversationsCache } from '../../../services/ChatService';
import { addLogs, getDisplayName, isSimulator } from '../../../common/utils';
import { CollectionInformation } from '../../Collection/CollectionInformation/CollectionInformation';
import { LexicalWrapper } from 'common/LexicalWrapper';
import { SEND_MESSAGE_IN_WA_GROUP } from 'graphql/mutations/Group';
import { GROUP_SEARCH_QUERY } from 'graphql/queries/WA_Groups';
import {
  getCachedGroupConverations,
  updateGroupConversationsCache,
} from 'services/GroupMessageService';

export interface ChatMessagesProps {
  contactId?: number | string | null;
  collectionId?: number | string | null;
  phoneId?: string;
  setPhonenumber?: any;
}

export const ChatMessages = ({
  contactId,
  collectionId,
  phoneId,
  setPhonenumber,
}: ChatMessagesProps) => {
  const urlString = new URL(window.location.href);
  const location = useLocation();

  let groups: boolean = location.pathname.includes('group');
  let chatType = groups ? 'waGroup' : 'contact';

  let messageParameterOffset: any = 0;
  let searchMessageNumber: any;

  // get the message number from url
  if (urlString.searchParams.get('search')) {
    searchMessageNumber = urlString.searchParams.get('search');
    // check if the message number is greater than 10 otherwise set the initial offset to 0
    messageParameterOffset =
      searchMessageNumber && parseInt(searchMessageNumber, 10) - 10 < 0
        ? 1
        : parseInt(searchMessageNumber, 10) - 10;
  }

  const [dialog, setDialogbox] = useState<string>();
  const [showDropdown, setShowDropdown] = useState<any>(null);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [scrolledToMessage, setScrolledToMessage] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [conversationInfo, setConversationInfo] = useState<any>({});
  const [collectionVariables, setCollectionVariables] = useState<any>({});
  const { t } = useTranslation();
  let dialogBox;

  useEffect(() => {
    setShowLoadMore(true);
    setScrolledToMessage(false);
    setShowJumpToLatest(false);
  }, [contactId]);

  useEffect(() => {
    setTimeout(() => {
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
    }, 1000);
  }, [setShowJumpToLatest, contactId]);

  const scrollToLatestMessage = () => {
    const container: any = document.querySelector('.messageContainer');
    if (container) {
      const scroll = container.scrollHeight - container.clientHeight;
      if (scroll) {
        container.scrollTo(0, scroll);
      }
    }
  };

  // Instantiate these to be used later.

  let conversationIndex: number = -1;
  let SEND_MESSAGE_MUTATION = groups ? SEND_MESSAGE_IN_WA_GROUP : CREATE_AND_SEND_MESSAGE_MUTATION;
  // create message mutation
  const [createAndSendMessage] = useMutation(SEND_MESSAGE_MUTATION, {
    onCompleted: () => {
      scrollToLatestMessage();
    },
    onError: (error: any) => {
      const { message } = error;
      if (message) {
        setNotification(message, 'warning');
      }
      return null;
    },
  });

  let search_query = groups ? GROUP_SEARCH_QUERY : SEARCH_QUERY;

  // get the conversations stored from the cache
  let queryVariables = groups ? GROUP_QUERY_VARIABLES : SEARCH_QUERY_VARIABLES;

  if (collectionId) {
    queryVariables = COLLECTION_SEARCH_QUERY_VARIABLES;
  }

  const {
    loading: conversationLoad,
    error: conversationError,
    data: allConversations,
  }: any = useQuery(search_query, {
    variables: queryVariables,
    fetchPolicy: 'cache-only',
  });

  useEffect(() => {
    const clickListener = () => setShowDropdown(null);
    if (showDropdown) {
      window.addEventListener('click', clickListener, true);
    }
    return () => {
      window.removeEventListener('click', clickListener);
    };
  }, [showDropdown]);

  const scrollToMessage = (messageNumberToScroll: any) => {
    setTimeout(() => {
      const scrollElement = document.querySelector(`#search${messageNumberToScroll}`);
      if (scrollElement) {
        scrollElement.scrollIntoView();
      }
    }, 1000);
  };

  // scroll to the particular message after loading
  const getScrollToMessage = () => {
    if (!scrolledToMessage) {
      scrollToMessage(urlString.searchParams.get('search'));
      setScrolledToMessage(true);
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
        const conversations = groups
          ? getCachedGroupConverations(queryVariables)
          : getCachedConverations(queryVariables);

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
          } else if (conversationObj[chatType]?.id === contactId?.toString()) {
            conversationObj.messages = conversationCopy.search[0].messages;
          }
          return conversationObj;
        });

        // update the conversation cache
        if (groups) {
          updateGroupConversationsCache(conversationsCopy, queryVariables);
        } else {
          updateConversationsCache(conversationsCopy, queryVariables);
        }

        // need to display Load more messages button
        setShowLoadMore(true);
      }
    },
  });

  const [getSearchQuery, { called, data, loading, error }] = useLazyQuery<any>(SEARCH_QUERY, {
    onCompleted: (searchData) => {
      if (searchData && searchData.search.length > 0) {
        // get the conversations from cache
        const conversations = groups
          ? getCachedGroupConverations(queryVariables)
          : getCachedConverations(queryVariables);

        const conversationCopy = JSON.parse(JSON.stringify(searchData));
        conversationCopy.search[0].messages
          .sort((currentMessage: any, nextMessage: any) => currentMessage.id - nextMessage.id)
          .reverse();

        let conversationsCopy: any = { search: [] };
        // check for the cache
        if (JSON.parse(JSON.stringify(conversations))) {
          conversationsCopy = JSON.parse(JSON.stringify(conversations));
        }
        let isContactCached = false;
        conversationsCopy.search = conversationsCopy.search.map((conversation: any) => {
          const conversationObj = conversation;
          // If the collection(group) is present in the cache
          if (collectionId) {
            if (conversationObj.group?.id === collectionId.toString()) {
              isContactCached = true;
              conversationObj.messages = [
                ...conversationObj.messages,
                ...conversationCopy.search[0].messages,
              ];
            }
          }
          // If the contact is present in the cache
          else if (conversationObj[chatType]?.id === contactId?.toString()) {
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
        if (groups) {
          updateGroupConversationsCache(conversationsCopy, queryVariables);
        } else {
          updateConversationsCache(conversationsCopy, queryVariables);
        }

        if (searchData.search[0].messages.length === 0) {
          setShowLoadMore(false);
        }
      }
    },
  });

  useEffect(() => {
    // scroll to the particular message after loading
    if (data || parameterdata) getScrollToMessage();
  }, [data, parameterdata]);

  let messageList: any;

  const [sendMessageToCollection] = useMutation(CREATE_AND_SEND_MESSAGE_TO_COLLECTION_MUTATION, {
    refetchQueries: [{ query: SEARCH_QUERY, variables: SEARCH_QUERY_VARIABLES }],
    onCompleted: () => {
      scrollToLatestMessage();
    },
    onError: (collectionError: any) => {
      const { message } = collectionError;
      if (message) {
        setNotification(message, 'warning');
      }
      return null;
    },
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

  const handleSendMessage = () => {
    setDialogbox('');
    sendMessageToCollection({
      variables: collectionVariables,
    });
  };

  // this function is called when the message is sent collection
  const sendCollectionMessageHandler = (
    body: string,
    mediaId: string,
    messageType: string,
    selectedTemplate: any,
    variableParam: any
  ) => {
    // display collection info popup
    setDialogbox('collection');

    const payload: any = {
      body,
      senderId: 1,
      mediaId,
      type: messageType,
      flow: 'OUTBOUND',
    };

    setCollectionVariables({
      groupId: collectionId,
      input: updatePayload(payload, selectedTemplate, variableParam),
    });
  };

  // this function is called when the message is sent
  const sendMessageHandler = useCallback(
    (
      body: any,
      mediaId: string,
      messageType: string,
      selectedTemplate: any,
      variableParam: any,
      interactiveTemplateId: any
    ) => {
      let payload: any;
      if (groups) {
        payload = {
          message: body,
          waManagedPhoneId: phoneId,
          waGroupId: contactId,
          type: messageType,
          mediaId,
        };
      } else {
        payload = {
          body,
          senderId: 1,
          receiverId: contactId,
          flow: 'OUTBOUND',
          interactiveTemplateId,
          type: messageType,
          mediaId,
        };

        payload = updatePayload(payload, selectedTemplate, variableParam);
      }

      createAndSendMessage({
        variables: { input: payload },
      });
    },
    [createAndSendMessage, contactId, phoneId]
  );

  // loop through the cached conversations and find if contact/Collection exists
  const updateConversationInfo = (type: string, Id: any) => {
    allConversations.search.map((conversation: any, index: any) => {
      if (conversation[type].id === Id.toString()) {
        conversationIndex = index;
        if (groups) {
          setPhonenumber(conversation.waGroup.waManagedPhone.id);
        }
        setConversationInfo(conversation);
      }
      return null;
    });
  };

  const findContactInAllConversations = () => {
    if (allConversations && allConversations.search) {
      // loop through the cached conversations and find if contact exists
      // need to check - updateConversationInfo('contact', contactId);
      allConversations.search.map((conversation: any, index: any) => {
        if (conversation[chatType]?.id === contactId?.toString()) {
          conversationIndex = index;
          if (groups) {
            setPhonenumber(conversation.waGroup.waManagedPhone.id);
          }

          setConversationInfo(conversation);
        }
        return null;
      });
    }

    // if conversation is not present then fetch for contact
    if (conversationIndex < 0) {
      if ((!loading && !called) || (data && data.search[0][chatType].id !== contactId)) {
        const variables = {
          filter: { id: contactId },
          contactOpts: { limit: 1 },
          messageOpts: {
            limit: DEFAULT_MESSAGE_LIMIT,
            offset: messageParameterOffset,
          },
        };

        addLogs(`if conversation is not present then search for contact-${contactId}`, variables);

        getSearchQuery({
          variables,
        });
      }
      // lets not get from cache if parameter is present
    } else if (conversationIndex > -1 && messageParameterOffset) {
      if (
        (!parameterLoading && !parameterCalled) ||
        (parameterdata && parameterdata.search[0][chatType].id !== contactId)
      ) {
        const variables = {
          filter: { id: contactId },
          contactOpts: { limit: 1 },
          messageOpts: {
            limit: DEFAULT_MESSAGE_LIMIT,
            offset: messageParameterOffset,
          },
        };

        addLogs(`if search message is not present then search for contact-${contactId}`, variables);

        getSearchParameterQuery({
          variables,
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
      if ((!loading && !called) || (data && data.search[0].group.id !== collectionId)) {
        const variables = {
          filter: { id: collectionId, searchGroup: true },
          contactOpts: { limit: DEFAULT_ENTITY_LIMIT },
          messageOpts: { limit: DEFAULT_MESSAGE_LIMIT, offset: 0 },
        };

        addLogs(
          `if conversation is not present then search for collection-${collectionId}`,
          variables
        );

        getSearchQuery({
          variables,
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

  useEffect(() => {
    if (searchMessageNumber) {
      const element = document.querySelector(`#search${searchMessageNumber}`);
      if (element) {
        element.scrollIntoView();
      } else {
        // need to check if message is not present fetch message from selected contact
      }
    }
  }, [searchMessageNumber]);

  // HOOKS ESTABLISHED ABOVE

  // Run through these cases to ensure data always exists
  if (called && error) {
    setErrorMessage(error);
    return null;
  }

  if (conversationError) {
    setErrorMessage(conversationError);
    return null;
  }

  // check if the search API results nothing for a particular contact ID and redirect to chat
  if (contactId && data) {
    if (data.search.length === 0 || data.search[0][chatType]?.status === 'BLOCKED') {
      return <Navigate to="/chat" />;
    }
  }

  const showEditDialog = (id: number) => {
    setShowDropdown(id);
  };

  // on reply message scroll to replied message or fetch if not present
  const jumpToMessage = (messageNumber: number) => {
    const element = document.querySelector(`#search${messageNumber}`);
    if (element) {
      element.scrollIntoView();
    } else {
      const offset = messageNumber - 10 <= 0 ? 1 : messageNumber - 10;
      const variables: any = {
        filter: { id: contactId?.toString() },
        contactOpts: { limit: 1 },
        messageOpts: {
          limit: conversationInfo.messages[conversationInfo.messages.length - 1].messageNumber,
          offset,
        },
      };

      addLogs(`fetch reply message`, variables);

      getSearchQuery({
        variables,
      });

      scrollToMessage(messageNumber);
    }
  };

  const showDaySeparator = (currentDate: string, nextDate: string) => {
    // if it's last message and its date is greater than current date then show day separator
    if (!nextDate && dayjs(currentDate).format(ISO_DATE_FORMAT) < dayjs().format(ISO_DATE_FORMAT)) {
      return true;
    }

    // if the day is changed then show day separator
    if (
      nextDate &&
      dayjs(currentDate).format(ISO_DATE_FORMAT) > dayjs(nextDate).format(ISO_DATE_FORMAT)
    ) {
      return true;
    }

    return false;
  };

  if (conversationInfo && conversationInfo.messages && conversationInfo.messages?.length > 0) {
    let reverseConversation = [...conversationInfo.messages];

    reverseConversation = reverseConversation.map((message: any, index: number) => {
      return (
        <ChatMessage
          groups={groups}
          {...message}
          contactId={contactId}
          key={message.id}
          popup={message.id === showDropdown}
          onClick={() => showEditDialog(message.id)}
          focus={index === 0}
          jumpToMessage={jumpToMessage}
          daySeparator={showDaySeparator(
            reverseConversation[index].insertedAt,
            reverseConversation[index + 1] ? reverseConversation[index + 1].insertedAt : null
          )}
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

    addLogs(`load More Messages-${collectionId}`, variables);

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
    const loadMoreOption =
      conversationInfo.messages?.length > DEFAULT_MESSAGE_LIMIT - 1 ||
      (searchMessageNumber && searchMessageNumber > 19);
    messageListContainer = (
      <Container
        className={`${styles.MessageList} messageContainer `}
        style={{ height: `calc(100% - 215px` }}
        maxWidth={false}
        data-testid="messageContainer"
      >
        {showLoadMore && loadMoreOption && (
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
                {t('Load more messages')}
              </div>
            )}
          </div>
        )}

        {messageList}
      </Container>
    );
  } else {
    messageListContainer = (
      <div className={styles.NoMessages} data-testid="messageContainer">
        {t('No messages.')}
      </div>
    );
  }

  if (groups && collectionId) {
    messageListContainer = (
      <div className={styles.NoMessages} data-testid="messageContainer">
        {t('No messages.')}
      </div>
    );
  }

  const handleChatClearedAction = () => {
    const conversationInfoCopy = JSON.parse(JSON.stringify(conversationInfo));
    conversationInfoCopy.messages = [];
    let allConversationsCopy: any = [];
    allConversationsCopy = JSON.parse(JSON.stringify(allConversations));
    const index = conversationIndex === -1 ? 0 : conversationIndex;
    allConversationsCopy.search[index] = conversationInfoCopy;
    // update allConversations in the cache
    if (groups) {
      updateGroupConversationsCache(allConversationsCopy, queryVariables);
    } else {
      updateConversationsCache(allConversationsCopy, queryVariables);
    }
  };

  // conversationInfo should not be empty
  if (!groups && !Object.prototype.hasOwnProperty.call(conversationInfo, 'contact')) {
    return (
      <div className={styles.LoadMore}>
        <CircularProgress className={styles.Loading} />
      </div>
    );
  }

  const showLatestMessage = () => {
    setShowJumpToLatest(false);

    // check if we have offset 0 (messageNumber === offset)
    if (conversationInfo.messages[0].messageNumber !== 0) {
      // set limit to default message limit
      const limit = DEFAULT_MESSAGE_LIMIT;

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

      addLogs(`show Latest Message for contact-${contactId}`, variables);

      getSearchParameterQuery({
        variables,
      });
    }

    scrollToLatestMessage();
  };

  const jumpToLatest = (
    <div
      data-testid="jumpToLatest"
      className={styles.JumpToLatest}
      onClick={() => showLatestMessage()}
      onKeyDown={() => showLatestMessage()}
      aria-hidden="true"
    >
      {t('Jump to latest')}
      <ExpandMoreIcon />
    </div>
  );

  let topChatBar;
  let chatInputSection;

  const isSimulatorProp = groups ? false : isSimulator(conversationInfo.contact?.phone);

  if (contactId && conversationInfo[chatType]) {
    const displayName = groups ? conversationInfo.waGroup.label : getDisplayName(conversationInfo);

    topChatBar = (
      <ContactBar
        displayName={displayName}
        isSimulator={isSimulatorProp}
        contactId={contactId.toString()}
        lastMessageTime={conversationInfo[chatType]?.lastMessageAt}
        contactStatus={conversationInfo[chatType]?.status}
        contactBspStatus={conversationInfo[chatType]?.bspStatus}
        handleAction={() => handleChatClearedAction()}
        groups={groups}
      />
    );

    chatInputSection = (
      <div className={styles.ChatInput}>
        {conversationInfo.messages.length && showJumpToLatest ? jumpToLatest : null}
        <LexicalWrapper>
          <ChatInput
            onSendMessage={sendMessageHandler}
            lastMessageTime={conversationInfo[chatType]?.lastMessageAt}
            contactStatus={conversationInfo[chatType]?.status}
            contactBspStatus={conversationInfo[chatType]?.bspStatus}
            showAttachmentButton={!groups}
          />
        </LexicalWrapper>
      </div>
    );
  } else if (collectionId && conversationInfo.group) {
    topChatBar = (
      <ContactBar
        collectionId={collectionId.toString()}
        displayName={conversationInfo.group.label}
        handleAction={handleChatClearedAction}
      />
    );

    chatInputSection = (
      <div className={styles.ChatInput}>
        {conversationInfo.messages.length && showJumpToLatest ? jumpToLatest : null}
        <LexicalWrapper>
          <ChatInput onSendMessage={sendCollectionMessageHandler} isCollection />
        </LexicalWrapper>
      </div>
    );
  }

  return (
    <Container className={styles.ChatMessages} maxWidth={false} disableGutters>
      {dialogBox}
      {dialog === 'collection' ? (
        <CollectionInformation
          collectionId={collectionId}
          displayPopup
          setDisplayPopup={() => setDialogbox('')}
          handleSendMessage={() => handleSendMessage()}
        />
      ) : null}
      {topChatBar}
      <StatusBar />
      {messageListContainer}
      {chatInputSection}
    </Container>
  );
};

export default ChatMessages;
