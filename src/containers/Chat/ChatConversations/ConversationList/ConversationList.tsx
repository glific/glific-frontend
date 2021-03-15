import React, { useEffect, useState } from 'react';
import { List, Container, CircularProgress, Typography } from '@material-ui/core';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { useApolloClient, useLazyQuery, useQuery } from '@apollo/client';
import moment from 'moment';

import styles from './ConversationList.module.css';
import ChatConversation from '../ChatConversation/ChatConversation';
import Loading from '../../../../components/UI/Layout/Loading/Loading';
import {
  SEARCH_QUERY,
  SEARCH_MULTI_QUERY,
  SCROLL_HEIGHT,
} from '../../../../graphql/queries/Search';
import { setErrorMessage } from '../../../../common/notification';
import {
  COLLECTION_SEARCH_QUERY_VARIABLES,
  SEARCH_QUERY_VARIABLES,
  DEFAULT_CONTACT_LIMIT,
  DEFAULT_MESSAGE_LIMIT,
  DEFAULT_CONTACT_LOADMORE_LIMIT,
} from '../../../../common/constants';
import { updateConversations } from '../../../../services/ChatService';
import { showMessages } from '../../../../common/responsive';

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
}

export const ConversationList: React.SFC<ConversationListProps> = (props) => {
  const {
    selectedContactId,
    searchVal,
    searchParam,
    savedSearchCriteria,
    savedSearchCriteriaId,
    selectedCollectionId,
    entityType = 'contact',
  } = props;
  const client = useApolloClient();
  const [loadingOffset, setLoadingOffset] = useState(DEFAULT_CONTACT_LIMIT);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const scrollHeight = useQuery(SCROLL_HEIGHT);

  let queryVariables = SEARCH_QUERY_VARIABLES;
  if (selectedCollectionId) {
    queryVariables = COLLECTION_SEARCH_QUERY_VARIABLES;
  }
  if (savedSearchCriteria) {
    const variables = JSON.parse(savedSearchCriteria);
    queryVariables = variables;
  }

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
  }, []);

  // reset offset value on saved search changes
  useEffect(() => {
    if (savedSearchCriteriaId) {
      setLoadingOffset(DEFAULT_CONTACT_LIMIT + 10);
    }
  }, [savedSearchCriteriaId]);

  const { loading: conversationLoading, error: conversationError, data } = useQuery<any>(
    SEARCH_QUERY,
    {
      variables: queryVariables,
      fetchPolicy: 'cache-only',
    }
  );

  const filterVariables = () => {
    if (props.savedSearchCriteria && Object.keys(props.searchParam).length === 0) {
      const variables = JSON.parse(props.savedSearchCriteria);
      if (props.searchVal) variables.filter.term = props.searchVal;
      return variables;
    }

    const filter: any = {};
    if (props.searchVal) {
      filter.term = props.searchVal;
    }
    const params = props.searchParam;
    if (params) {
      if (params.includeTags && params.includeTags.length > 0)
        filter.includeTags = params.includeTags.map((obj: any) => obj.id);
      if (params.includeGroups && params.includeGroups.length > 0)
        filter.includeGroups = params.includeGroups.map((obj: any) => obj.id);
      if (params.includeUsers && params.includeUsers.length > 0)
        filter.includeUsers = params.includeUsers.map((obj: any) => obj.id);
      if (params.dateFrom) {
        filter.dateRange = {
          from: moment(params.dateFrom).format('YYYY-MM-DD'),
          to: moment(params.dateTo).format('YYYY-MM-DD'),
        };
      }
    }

    return {
      contactOpts: {
        limit: DEFAULT_CONTACT_LIMIT,
      },
      filter,
      messageOpts: {
        limit: DEFAULT_MESSAGE_LIMIT,
      },
    };
  };

  const filterSearch = () => ({
    contactOpts: {
      limit: DEFAULT_CONTACT_LIMIT,
      order: 'DESC',
    },
    searchFilter: {
      term: props.searchVal,
    },
    messageOpts: {
      limit: DEFAULT_MESSAGE_LIMIT,
      order: 'ASC',
    },
  });

  const [loadMoreConversations, { data: contactsData }] = useLazyQuery<any>(SEARCH_QUERY, {
    onCompleted: (searchData) => {
      if (searchData && searchData.search.length === 0) {
        setShowLoadMore(false);
      } else {
        // save the conversation and update cache
        updateConversations(searchData, client, queryVariables);
        setShowLoadMore(true);

        setLoadingOffset(loadingOffset + DEFAULT_CONTACT_LOADMORE_LIMIT);
      }
    },
  });

  useEffect(() => {
    if (contactsData) {
      setShowLoading(false);
    }
  }, [contactsData]);

  const [getFilterConvos, { called, loading, error, data: searchData }] = useLazyQuery<any>(
    SEARCH_QUERY
  );

  const [getFilterSearch, { loading: loadingSearch, data: searchMultiData }] = useLazyQuery<any>(
    SEARCH_MULTI_QUERY
  );

  useEffect(() => {
    // Use multi search when has search value and when there is no collection id
    if (searchVal && Object.keys(searchParam).length === 0 && !selectedCollectionId) {
      getFilterSearch({
        variables: filterSearch(),
      });
    } else {
      // This is used for filtering the searches, when you click on it, so only call it
      // when user clicks and savedSearchCriteriaId is set.
      getFilterConvos({
        variables: filterVariables(),
      });
    }
  }, [searchVal, searchParam, savedSearchCriteria]);

  // Other cases
  if ((called && loading) || conversationLoading || loadingSearch) return <Loading />;

  if ((called && error) || conversationError) {
    if (error) {
      setErrorMessage(client, error);
    } else if (conversationError) {
      setErrorMessage(client, conversationError);
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
    if (props.selectedContactId === contact.id) {
      selectedRecord = true;
    }

    return (
      <>
        {index === 0 ? header : null}
        <ChatConversation
          key={contact.id}
          selected={selectedRecord}
          onClick={() => {
            setSearchHeight();
            if (entityType === 'contact' && props.setSelectedContactId) {
              props.setSelectedContactId(contact.id);
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
          highlightSearch={props.searchVal}
          messageNumber={conversation.messageNumber}
          searchMode={props.searchMode}
        />
      </>
    );
  };

  let conversationList: any;
  // If a search term is used, use the SearchMulti API. For searches term, this is not applicable.
  if (searchVal && searchMultiData && Object.keys(searchParam).length === 0) {
    conversations = searchMultiData.searchMulti;
    // to set search response sequence
    const searchArray = { contacts: [], tags: [], messages: [] };
    let conversationsData;
    Object.keys(searchArray).map((dataArray: any) => {
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
      return null;
    });
  }

  // build the conversation list only if there are conversations
  if (!conversationList && conversations && conversations.length > 0) {
    // TODO: Need to check why test is not returing correct result
    conversationList = conversations.map((conversation: any, index: number) => {
      let lastMessage = [];
      if (conversation.messages.length > 0) {
        [lastMessage] = conversation.messages;
      }
      const key = index;

      let entityId: any;
      let displayName = '';
      let senderLastMessage = '';
      let contactStatus = '';
      let contactBspStatus = '';
      let selectedRecord = false;
      if (conversation.contact) {
        if (props.selectedContactId === conversation.contact.id) {
          selectedRecord = true;
        }
        entityId = conversation.contact.id;
        if (conversation.contact.name) {
          displayName = conversation.contact.name;
        } else {
          displayName = conversation.contact.maskedPhone;
        }
        senderLastMessage = conversation.contact.lastMessageAt;
        contactStatus = conversation.contact.status;
        contactBspStatus = conversation.contact.bspStatus;
      } else if (conversation.group) {
        if (props.selectedCollectionId === conversation.group.id) {
          selectedRecord = true;
        }
        entityId = conversation.group.id;
        displayName = conversation.group.label;
      }

      return (
        <ChatConversation
          key={key}
          selected={selectedRecord}
          onClick={() => {
            setSearchHeight();
            showMessages();
            if (entityType === 'contact' && props.setSelectedContactId) {
              props.setSelectedContactId(conversation.contact.id);
            } else if (entityType === 'collection' && props.setSelectedCollectionId) {
              props.setSelectedCollectionId(conversation.group.id);
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
        />
      );
    });
  }

  if (!conversationList) {
    conversationList = <p data-testid="empty-result">You do not have any conversations.</p>;
  }

  const loadMoreMessages = () => {
    let filter = {};
    // for saved search use filter value of selected search
    if (savedSearchCriteria) {
      const variables = JSON.parse(savedSearchCriteria);
      filter = variables.filter;
    }
    const conversationLoadMoreVariables = {
      contactOpts: {
        limit: DEFAULT_CONTACT_LOADMORE_LIMIT,
        offset: loadingOffset,
      },
      filter,
      messageOpts: {
        limit: DEFAULT_MESSAGE_LIMIT,
      },
    };

    if (selectedCollectionId) {
      conversationLoadMoreVariables.filter = { searchGroup: true };
    }

    loadMoreConversations({
      variables: conversationLoadMoreVariables,
    });
    setShowLoading(true);
  };

  const showLatestContact = () => {
    const container: any = document.querySelector('.contactsContainer');
    if (container) {
      container.scrollTop = 0;
    }
  };

  const scrollToTop = (
    <div
      className={styles.ScrollToTopButton}
      onClick={showLatestContact}
      onKeyDown={showLatestContact}
      aria-hidden="true"
    >
      Go to top
      <KeyboardArrowUpIcon />
    </div>
  );

  return (
    <Container
      className={`${
        selectedContactId ? styles.ListingContainer : styles.CollectionListingContainer
      } contactsContainer`}
      disableGutters
    >
      {showJumpToLatest && !showLoading ? scrollToTop : null}
      <List className={styles.StyledList}>
        {conversationList}
        {showLoadMore && conversations.length > DEFAULT_CONTACT_LIMIT - 1 ? (
          <div className={styles.LoadMore}>
            {showLoading ? (
              <CircularProgress className={styles.Progress} />
            ) : (
              <div
                onClick={loadMoreMessages}
                onKeyDown={loadMoreMessages}
                className={styles.LoadMoreButton}
                aria-hidden="true"
              >
                Load more chats
              </div>
            )}
          </div>
        ) : null}
      </List>
    </Container>
  );
};

export default ConversationList;
