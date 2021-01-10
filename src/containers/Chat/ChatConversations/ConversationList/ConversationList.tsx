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
  SEARCH_OFFSET,
} from '../../../../graphql/queries/Search';
import { setErrorMessage } from '../../../../common/notification';
import { SEARCH_QUERY_VARIABLES } from '../../../../common/constants';
import { updateConversations } from '../../../../services/ChatService';

interface ConversationListProps {
  searchVal: string;
  selectedContactId: number;
  setSelectedContactId: (i: number) => void;
  savedSearchCriteria: string | null;
  searchParam?: any;
  searchMode: boolean;
}

export const ConversationList: React.SFC<ConversationListProps> = (props) => {
  const { selectedContactId, searchVal, searchParam, savedSearchCriteria } = props;
  const client = useApolloClient();
  const queryVariables = SEARCH_QUERY_VARIABLES;
  const [loadingOffset, setLoadingOffset] = useState(50);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const offset = useQuery(SEARCH_OFFSET);
  const scrollHeight = useQuery(SCROLL_HEIGHT);

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
      filter,
      messageOpts: {
        limit: 50,
      },
      contactOpts: {
        limit: 50,
      },
    };
  };

  const filterSearch = () => {
    return {
      searchFilter: {
        term: props.searchVal,
      },
      messageOpts: {
        limit: 50,
        order: 'ASC',
      },
      contactOpts: {
        order: 'DESC',
        limit: 50,
      },
    };
  };

  const [loadMoreConversations, { data: contactsData }] = useLazyQuery<any>(SEARCH_QUERY, {
    onCompleted: (searchData) => {
      if (searchData && searchData.search.length === 0) {
        setShowLoadMore(false);
      } else {
        // save the conversation and update cache
        updateConversations(searchData, client, queryVariables);

        setLoadingOffset(loadingOffset + 10);
      }
    },
  });

  // We are using this after the search to get selected search data.
  useEffect(() => {
    let offsetValue = 0;
    if (offset.data) {
      offsetValue = offset.data.offset - 25 <= 0 ? 0 : offset.data.offset - 10; // calculate offset
    }
    if (props.selectedContactId && offsetValue) {
      loadMoreConversations({
        variables: {
          contactOpts: {
            limit: 1,
          },
          filter: {
            id: selectedContactId,
          },
          messageOpts: {
            limit: 50,
            offset: offsetValue,
          },
        },
      });
    }
  }, [offset, selectedContactId]);

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
    // Use multi search when has search value
    if (searchVal !== '' && Object.keys(searchParam).length === 0) {
      getFilterSearch({
        variables: filterSearch(),
      });
    } else {
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
  if (called && (searchVal !== '' || savedSearchCriteria || searchParam)) {
    conversations = searchData.search;
  }

  const buildChatConversation = (index: number, header: any, conversation: any) => {
    // We don't have the contact data in the case of contacts.
    let contact = conversation;
    if (conversation.contact) {
      contact = conversation.contact;
    }

    return (
      <>
        {index === 0 ? header : null}
        <ChatConversation
          key={contact.id}
          selected={props.selectedContactId === contact.id}
          onClick={() => {
            setSearchHeight();
            props.setSelectedContactId(contact.id);
          }}
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
  if (searchVal !== '' && searchMultiData && Object.keys(searchParam).length === 0) {
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
      conversationsData = conversations[dataArray].map((conversation: any, index: number) => {
        return buildChatConversation(index, header, conversation);
      });
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
      return (
        <ChatConversation
          key={key}
          selected={props.selectedContactId === conversation.contact.id}
          onClick={() => {
            setSearchHeight();
            props.setSelectedContactId(conversation.contact.id);
          }}
          index={index}
          contactId={conversation.contact.id}
          contactName={
            conversation.contact.name ? conversation.contact.name : conversation.contact.maskedPhone
          }
          lastMessage={lastMessage}
          senderLastMessage={conversation.contact.lastMessageAt}
          contactStatus={conversation.contact.status}
          contactBspStatus={conversation.contact.bspStatus}
        />
      );
    });
  }

  if (!conversationList) {
    conversationList = <p data-testid="empty-result">You do not have any conversations.</p>;
  }

  const loadMoreMessages = () => {
    loadMoreConversations({
      variables: {
        contactOpts: {
          limit: 10,
          offset: loadingOffset,
        },
        filter: {},
        messageOpts: {
          limit: 50,
        },
      },
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

  // scroll to message after click from search
  const element = document.getElementById(window.location.hash);
  if (element) {
    element.scrollIntoView();
  }

  return (
    <Container className={`${styles.ListingContainer} contactsContainer`} disableGutters>
      {showJumpToLatest && !showLoading ? scrollToTop : null}
      {conversationList ? (
        <List className={styles.StyledList}>
          {conversationList}
          {showLoadMore && conversations.length > 49 ? (
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
      ) : (
        { conversationList }
      )}
    </Container>
  );
};

export default ConversationList;
