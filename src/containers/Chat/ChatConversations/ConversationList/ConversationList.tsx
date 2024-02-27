import { Fragment, useEffect, useState } from 'react';
import { List, Container, CircularProgress, Typography } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useApolloClient, useLazyQuery, useQuery } from '@apollo/client';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { Loading } from 'components/UI/Layout/Loading/Loading';
import { SEARCH_QUERY, SEARCH_MULTI_QUERY, SCROLL_HEIGHT } from 'graphql/queries/Search';
import { setErrorMessage } from 'common/notification';
import {
  COLLECTION_SEARCH_QUERY_VARIABLES,
  SEARCH_QUERY_VARIABLES,
  DEFAULT_CONTACT_LIMIT,
  DEFAULT_MESSAGE_LIMIT,
  DEFAULT_CONTACT_LOADMORE_LIMIT,
  DEFAULT_MESSAGE_LOADMORE_LIMIT,
  ISO_DATE_FORMAT,
  GROUP_QUERY_VARIABLES,
} from 'common/constants';
import { updateConversations } from 'services/ChatService';
import { updateGroupConversations } from 'services/GroupMessageService';
import { showMessages } from 'common/responsive';
import { addLogs, getDisplayName } from 'common/utils';
import ChatConversation from '../ChatConversation/ChatConversation';
import styles from './ConversationList.module.css';
import { groupCollectionSearchQuery, groupSearchQuery } from 'mocks/Groups';
import GroupConversation from 'containers/WA_Groups/GroupConversations/GroupConversation';
import { GROUP_SEARCH_QUERY } from 'graphql/queries/WA_Groups';

interface ConversationListProps {
  searchVal: string;
  selectedContactId?: number;
  setSelectedContactId?: (i: number) => void;
  savedSearchCriteria?: string | null;
  savedSearchCriteriaId?: number | null;
  searchParam?: any;
  searchMode: boolean;
  selectedCollectionId?: number;
  setSelectedCollectionId?: (i: number) => void;
  entityType?: string;
  groups?: boolean;
}

export const ConversationList = ({
  searchVal,
  selectedContactId,
  setSelectedContactId,
  savedSearchCriteria,
  savedSearchCriteriaId,
  searchParam,
  searchMode,
  selectedCollectionId,
  setSelectedCollectionId,
  entityType = 'contact',
  groups = false,
}: ConversationListProps) => {
  const client = useApolloClient();
  const [loadingOffset, setLoadingOffset] = useState(DEFAULT_CONTACT_LIMIT);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [searchMultiData, setSearchMultiData] = useState<any>();
  const scrollHeight = useQuery(SCROLL_HEIGHT);
  const { t } = useTranslation();
  let chatType = 'contact';
  if (groups) {
    chatType = 'waGroup';
  }

  let queryVariables = groups ? GROUP_QUERY_VARIABLES : SEARCH_QUERY_VARIABLES;
  if (selectedCollectionId) {
    queryVariables = COLLECTION_SEARCH_QUERY_VARIABLES;
  }
  if (savedSearchCriteria) {
    const variables = JSON.parse(savedSearchCriteria);
    queryVariables = variables;
  }
  let search_query = groups && !selectedCollectionId ? GROUP_SEARCH_QUERY : SEARCH_QUERY;
  let contactOptions = groups ? 'waGroupOpts' : 'contactOpts';
  let messageOptions = groups ? 'waMessageOpts' : 'messageOpts';

  // check if there is a previous scroll height
  useEffect(() => {
    if (scrollHeight.data && scrollHeight.data.height) {
      const container = document.querySelector('.contactsContainer');
      if (container) {
        container.scrollTop = scrollHeight.data.height;
      }
    }
  }, [scrollHeight.data]);

  useEffect(() => {
    const contactsContainer: any = document.querySelector('.contactsContainer');
    if (contactsContainer) {
      contactsContainer.addEventListener('scroll', (event: any) => {
        const contactContainer = event.target;
        if (contactContainer.scrollTop === 0) {
          setShowJumpToLatest(false);
        } else if (showJumpToLatest === false) {
          setShowJumpToLatest(true);
        }
      });
    }
  });

  const groupData =
    entityType === 'collection'
      ? groupCollectionSearchQuery()
      : groupSearchQuery({ limit: DEFAULT_MESSAGE_LIMIT }, DEFAULT_CONTACT_LIMIT, {});

  const {
    loading: conversationLoading,
    error: conversationError,
    data,
    refetch,
  } = useQuery<any>(search_query, {
    variables: queryVariables,
    fetchPolicy: 'cache-only',
  });

  // reset offset value on saved search changes
  useEffect(() => {
    if (savedSearchCriteriaId) {
      setLoadingOffset(DEFAULT_CONTACT_LIMIT);
      refetch(queryVariables);
    }
  }, [savedSearchCriteriaId]);

  const filterVariables = () => {
    if (savedSearchCriteria && Object.keys(searchParam).length === 0) {
      const variables = JSON.parse(savedSearchCriteria);
      if (searchVal) variables.filter.term = searchVal;
      return variables;
    }

    const filter: any = {};
    if (searchVal) {
      filter.term = searchVal;
    }
    const params = searchParam;
    if (params) {
      if (params.includeGroups && params.includeGroups.length > 0)
        filter.includeGroups = params.includeGroups.map((obj: any) => obj.id);
      if (params.includeUsers && params.includeUsers.length > 0)
        filter.includeUsers = params.includeUsers.map((obj: any) => obj.id);
      if (params.includeLabels && params.includeLabels.length > 0)
        filter.includeLabels = params.includeLabels.map((obj: any) => obj.id);
      if (params.dateFrom) {
        filter.dateRange = {
          from: dayjs(params.dateFrom).format(ISO_DATE_FORMAT),
          to: dayjs(params.dateTo).format(ISO_DATE_FORMAT),
        };
      }
    }
    // If tab is collection then add appropriate filter
    if (selectedCollectionId) {
      filter.searchGroup = true;
      if (searchVal) {
        delete filter.term;
        filter.groupLabel = searchVal;
      }
    }

    return {
      [contactOptions]: {
        limit: DEFAULT_CONTACT_LIMIT,
      },
      filter,
      [messageOptions]: {
        limit: DEFAULT_MESSAGE_LIMIT,
      },
    };
  };

  const filterSearch = () => ({
    [contactOptions]: {
      limit: DEFAULT_CONTACT_LIMIT,
      order: 'DESC',
    },
    searchFilter: {
      term: searchVal,
    },
    [messageOptions]: {
      limit: DEFAULT_MESSAGE_LIMIT,
      offset: 0,
      order: 'ASC',
    },
  });

  const [getFilterConvos, { called, loading, error, data: searchData }] = useLazyQuery<any>(
    search_query,
    { variables: queryVariables }
  );

  // fetch data when typing for search
  const [getFilterSearch] = useLazyQuery<any>(SEARCH_MULTI_QUERY, {
    onCompleted: (multiSearch) => {
      setSearchMultiData(multiSearch);
    },
  });

  // load more messages for multi search load more
  const [getLoadMoreFilterSearch, { loading: loadingSearch }] = useLazyQuery<any>(
    SEARCH_MULTI_QUERY,
    {
      onCompleted: (multiSearch) => {
        if (!searchMultiData) {
          setSearchMultiData(multiSearch);
        } else if (multiSearch && multiSearch.searchMulti.messages.length !== 0) {
          const searchMultiDataCopy = JSON.parse(JSON.stringify(searchMultiData));
          // append new messages to existing messages
          searchMultiDataCopy.searchMulti.messages = [
            ...searchMultiData.searchMulti.messages,
            ...multiSearch.searchMulti.messages,
          ];
          setSearchMultiData(searchMultiDataCopy);
        } else {
          setShowLoadMore(false);
        }
        setShowLoading(false);
      },
    }
  );

  useEffect(() => {
    // Use multi search when has search value and when there is no collection id
    if (searchVal && Object.keys(searchParam).length === 0 && !selectedCollectionId) {
      addLogs(`Use multi search when has search value`, filterSearch());
      getFilterSearch({
        variables: filterSearch(),
      });
    } else {
      // This is used for filtering the searches, when you click on it, so only call it
      // when user clicks and savedSearchCriteriaId is set.
      addLogs(`filtering the searches`, filterVariables());
      getFilterConvos({
        variables: filterVariables(),
      });
    }
  }, [searchVal, searchParam, savedSearchCriteria]);

  // Other cases
  if ((called && loading) || conversationLoading) return <Loading />;

  if ((called && error) || conversationError) {
    if (error) {
      setErrorMessage(error);
    } else if (conversationError) {
      setErrorMessage(conversationError);
    }

    return null;
  }

  const setSearchHeight = () => {
    client.writeQuery({
      query: SCROLL_HEIGHT,
      data: { height: document.querySelector('.contactsContainer')?.scrollTop },
    });
  };

  let conversations: any = null;
  // Retrieving all convos or the ones searched by.
  if (data) {
    conversations = data.search;
  }

  // If no cache, assign conversations data from search query.
  if (called && (searchVal || savedSearchCriteria || searchParam)) {
    conversations = searchData.search;
  }

  const buildChatConversation = (index: number, header: any, conversation: any) => {
    // We don't have the contact data in the case of contacts.
    let contact = conversation;
    if (conversation.contact) {
      contact = conversation.contact;
    }

    let selectedRecord = false;
    if (selectedContactId === contact.id) {
      selectedRecord = true;
    }

    return (
      <Fragment key={contact.id}>
        {index === 0 ? header : null}
        <ChatConversation
          key={contact.id}
          selected={selectedRecord}
          onClick={() => {
            setSearchHeight();
            if (entityType === 'contact' && setSelectedContactId) {
              setSelectedContactId(contact.id);
            }
          }}
          entityType={entityType}
          index={index}
          contactId={contact.id}
          contactName={contact.name || contact.maskedPhone}
          lastMessage={conversation}
          senderLastMessage={contact.lastMessageAt}
          contactStatus={contact.status}
          contactBspStatus={contact.bspStatus}
          contactIsOrgRead={contact.isOrgRead}
          highlightSearch={searchVal}
          messageNumber={conversation.messageNumber}
          searchMode={searchMode}
        />
      </Fragment>
    );
  };

  let conversationList: any;
  // If a search term is used, use the SearchMulti API. For searches term, this is not applicable.
  if (searchVal && searchMultiData && Object.keys(searchParam).length === 0) {
    conversations = groups ? groupData?.result?.data : searchMultiData.searchMulti;

    // to set search response sequence
    const searchArray = { contacts: [], messages: [], labels: [] };
    let conversationsData;
    Object.keys(searchArray).forEach((dataArray: any) => {
      const header = (
        <div className={styles.Title}>
          <Typography className={styles.TitleText}>{dataArray}</Typography>
        </div>
      );
      conversationsData = conversations[dataArray].map((conversation: any, index: number) =>
        buildChatConversation(index, header, conversation)
      );
      // Check if its not empty
      if (conversationsData.length > 0) {
        if (!conversationList) conversationList = [];
        conversationList.push(conversationsData);
      }
    });
  }

  // build the conversation list only if there are conversations
  if (!conversationList && conversations && conversations.length > 0) {
    conversationList = conversations.map((conversation: any, index: number) => {
      let lastMessage = [];
      if (conversation.messages.length > 0) {
        [lastMessage] = conversation.messages;
      }
      const key = index;

      let entityId: any;
      let senderLastMessage = '';
      let displayName = '';
      let contactStatus = '';
      let contactBspStatus = '';
      let contactIsOrgRead = false;
      let selectedRecord = false;
      if (conversation.waGroup) {
        if (selectedContactId === conversation.waGroup?.id) {
          selectedRecord = true;
        }
        entityId = conversation.waGroup?.id;
        displayName = conversation.waGroup?.label;
        contactIsOrgRead = false;
        senderLastMessage = conversation.waGroup.lastCommunicationAt;
      } else if (conversation.contact) {
        if (selectedContactId === conversation.contact.id) {
          selectedRecord = true;
        }
        entityId = conversation.contact.id;
        displayName = getDisplayName(conversation);
        senderLastMessage = conversation.contact.lastMessageAt;
        contactStatus = conversation.contact.status;
        contactBspStatus = conversation.contact.bspStatus;
        contactIsOrgRead = conversation.contact.isOrgRead;
      }

      if (conversation.group) {
        if (selectedCollectionId === conversation.group.id) {
          selectedRecord = true;
        }
        entityId = conversation.group.id;
        displayName = conversation.group.label;
        contactIsOrgRead = conversation.group.isOrgRead;
      }

      return groups ? (
        <GroupConversation
          key={key}
          selected={selectedRecord}
          onClick={() => {
            setSearchHeight();
            showMessages();
            if (entityType === 'contact' && setSelectedContactId) {
              setSelectedContactId(conversation.waGroup?.id);
            } else if (entityType === 'collection' && setSelectedCollectionId) {
              setSelectedCollectionId(conversation.group.id);
            }
          }}
          index={index}
          contactId={entityId}
          entityType={entityType}
          contactName={displayName}
          lastMessage={lastMessage}
          senderLastMessage={senderLastMessage}
          contactStatus={contactStatus}
          contactBspStatus={contactBspStatus}
          contactIsOrgRead={contactIsOrgRead}
        />
      ) : (
        <ChatConversation
          key={key}
          selected={selectedRecord}
          onClick={() => {
            setSearchHeight();
            showMessages();
            if (entityType === 'contact' && setSelectedContactId) {
              setSelectedContactId(conversation.contact.id);
            } else if (entityType === 'collection' && setSelectedCollectionId) {
              setSelectedCollectionId(conversation.group.id);
            }
          }}
          index={index}
          contactId={entityId}
          entityType={entityType}
          contactName={displayName}
          lastMessage={lastMessage}
          senderLastMessage={senderLastMessage}
          contactStatus={contactStatus}
          contactBspStatus={contactBspStatus}
          contactIsOrgRead={contactIsOrgRead}
        />
      );
    });
  }

  if (!conversationList) {
    conversationList = (
      <p data-testid="empty-result" className={styles.EmptySearch}>
        {t(`Sorry, no results found!
    Please try a different search.`)}
      </p>
    );
  }

  const loadMoreMessages = () => {
    setShowLoading(true);
    // load more for multi search
    if (searchVal && !selectedCollectionId) {
      const variables = filterSearch();
      variables[messageOptions] = {
        limit: DEFAULT_MESSAGE_LOADMORE_LIMIT,
        offset: conversations.messages.length,
        order: 'ASC',
      };

      getLoadMoreFilterSearch({
        variables,
      });
    } else {
      let filter: any = {};
      // for saved search use filter value of selected search
      if (savedSearchCriteria) {
        const variables = JSON.parse(savedSearchCriteria);
        filter = variables.filter;
      }

      if (searchVal) {
        filter = { term: searchVal };
      }

      // Adding appropriate data if selected tab is collection
      if (selectedCollectionId) {
        filter = { searchGroup: true };
        if (searchVal) {
          filter.groupLabel = searchVal;
        }
      }

      const conversationLoadMoreVariables: any = {
        [contactOptions]: {
          limit: DEFAULT_CONTACT_LOADMORE_LIMIT,
          offset: loadingOffset,
        },
        filter,
        [messageOptions]: {
          limit: DEFAULT_MESSAGE_LIMIT,
        },
      };

      client
        .query({
          query: search_query,
          variables: conversationLoadMoreVariables,
        })
        .then(({ data: loadMoreData }) => {
          if (loadMoreData && loadMoreData.search.length === 0) {
            setShowLoadMore(false);
          } else {
            // Now if there is search string and tab is collection then load more will return appropriate data
            const variables: any = queryVariables;
            if (selectedCollectionId && searchVal) {
              variables.filter.groupLabel = searchVal;
            }
            // save the conversation and update cache
            if (groups) {
              updateGroupConversations(loadMoreData, variables);
            } else {
              updateConversations(loadMoreData, variables);
            }
            setShowLoadMore(true);

            setLoadingOffset(loadingOffset + DEFAULT_CONTACT_LOADMORE_LIMIT);
          }
          setShowLoading(false);
        })
        .catch(() => setShowLoading(false));
    }
  };

  const showLatestContact = () => {
    const container: any = document.querySelector('.contactsContainer');
    if (container) {
      container.scrollTop = 0;
    }
  };

  let scrollTopStyle = selectedContactId
    ? styles.ScrollToTopContacts
    : styles.ScrollToTopCollections;

  scrollTopStyle = entityType === 'savedSearch' ? styles.ScrollToTopSearches : scrollTopStyle;

  const scrollToTop = (
    <div
      className={scrollTopStyle}
      onClick={showLatestContact}
      onKeyDown={showLatestContact}
      aria-hidden="true"
    >
      {t('Go to top')}
      <KeyboardArrowUpIcon />
    </div>
  );

  const loadMore = (
    <div className={styles.LoadMore}>
      {showLoading || loadingSearch ? (
        <CircularProgress className={styles.Progress} />
      ) : (
        <div
          onClick={loadMoreMessages}
          onKeyDown={loadMoreMessages}
          className={styles.LoadMoreButton}
          aria-hidden="true"
        >
          {t('Load more')}
        </div>
      )}
    </div>
  );

  const entityStyles: any = {
    contact: styles.ChatListingContainer,
    collection: styles.CollectionListingContainer,
    savedSearch: styles.SaveSearchListingContainer,
  };

  const entityStyle = entityStyles[entityType];

  return (
    <Container
      className={`${entityStyle} contactsContainer`}
      disableGutters
      data-testid="listingContainer"
    >
      {showJumpToLatest && !showLoading ? scrollToTop : null}
      <List className={styles.StyledList}>
        {conversationList}
        {showLoadMore &&
        conversations &&
        (conversations.length > DEFAULT_CONTACT_LIMIT - 1 ||
          conversations.messages?.length > DEFAULT_MESSAGE_LIMIT - 1)
          ? loadMore
          : null}
      </List>
    </Container>
  );
};

export default ConversationList;
