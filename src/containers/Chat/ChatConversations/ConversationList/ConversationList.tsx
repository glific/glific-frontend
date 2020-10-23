import React, { useEffect, useState } from 'react';
import { List, Container, CircularProgress, Typography } from '@material-ui/core';
import { useApolloClient, useLazyQuery, useQuery } from '@apollo/client';
import moment from 'moment';

import ChatConversation from '../ChatConversation/ChatConversation';
import Loading from '../../../../components/UI/Layout/Loading/Loading';
import {
  SEARCH_QUERY,
  SEARCH_MULTI_QUERY,
  SEARCH_OFFSET,
} from '../../../../graphql/queries/Search';
import { setErrorMessage } from '../../../../common/notification';
import { SEARCH_QUERY_VARIABLES } from '../../../../common/constants';
import styles from './ConversationList.module.css';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { updateConversations } from '../../../../services/ChatService';

interface ConversationListProps {
  searchVal: string;
  selectedContactId: number;
  setSelectedContactId: (i: number) => void;
  savedSearchCriteria: string | null;
  searchParam?: any;
}

export const ConversationList: React.SFC<ConversationListProps> = (props) => {
  const client = useApolloClient();
  const queryVariables = SEARCH_QUERY_VARIABLES;
  const [loadingOffset, setLoadingOffset] = useState(50);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const offset = useQuery(SEARCH_OFFSET);

  useEffect(() => {
    const contactsContainer: any = document.querySelector('.contactsContainer');
    if (contactsContainer) {
      contactsContainer.addEventListener('scroll', (event: any) => {
        const contactsContainer = event.target;
        if (contactsContainer.scrollTop === 0) {
          setShowJumpToLatest(false);
        } else if (showJumpToLatest === false) {
          setShowJumpToLatest(true);
        }
      });
    }
  }, []);

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
            id: props.selectedContactId,
          },
          messageOpts: {
            limit: 50,
            offset: offsetValue,
          },
        },
      });
    }
    //setShowLoading(true);
  }, [offset, props.selectedContactId]);

  const { loading: conversationLoading, error: conversationError, data } = useQuery<any>(
    SEARCH_QUERY,
    {
      variables: queryVariables,
      fetchPolicy: 'cache-first',
    }
  );
  const filterVariables = () => {
    if (props.savedSearchCriteria && Object.keys(props.searchParam).length === 0) {
      let variables = JSON.parse(props.savedSearchCriteria);
      if (props.searchVal) variables.filter.term = props.searchVal;
      return variables;
    }

    let filter: any = {};
    if (props.searchVal) {
      filter.term = props.searchVal;
    }
    let params = props.searchParam;
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
      filter: filter,
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

  useEffect(() => {
    // Use multi search when has search value
    if (props.searchVal !== '' && Object.keys(props.searchParam).length === 0) {
      getFilterSearch({
        variables: filterSearch(),
      });
    } else {
      getFilterConvos({
        variables: filterVariables(),
      });
    }
  }, [props.searchVal, props.searchParam, props.savedSearchCriteria]);

  const [loadMoreConversations, { data: contactsData }] = useLazyQuery<any>(SEARCH_QUERY, {
    onCompleted: (data) => {
      if (data && data.search.length === 0) {
        setShowLoadMore(false);
      } else {
        console.log('data', data);
        // const conversations = client.readQuery({
        //   query: SEARCH_QUERY,
        //   variables: queryVariables,
        // });

        // const conversationCopy = JSON.parse(JSON.stringify(data));

        // const conversationsCopy = JSON.parse(JSON.stringify(conversations));
        // conversationsCopy.search = [...conversationsCopy.search, ...conversationCopy.search];

        // client.writeQuery({
        //   query: SEARCH_QUERY,
        //   variables: queryVariables,
        //   data: conversationsCopy,
        // });

        // save the conversation and update cache
        updateConversations(data, client, queryVariables);

        setLoadingOffset(loadingOffset + 10);
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

  let conversations: any = null;
  // Retrieving all convos or the ones searched by.
  if (data) {
    conversations = data.search;
  }

  // If no cache, assign conversations data from search query.
  if (called && (props.searchVal !== '' || props.savedSearchCriteria || props.searchParam)) {
    conversations = searchData.search;
  }

  let conversationList: any;
  // If a search term is used, use the SearchMulti API. For collection term, this is not applicable.
  if (props.searchVal !== '' && searchMultiData && Object.keys(props.searchParam).length === 0) {
    conversations = searchMultiData.searchMulti;
    // to set search response sequence
    let searchArray = { contacts: [], tags: [], messages: [] };
    let data;
    Object.keys(searchArray).map((dataArray: any) => {
      let header = (
        <div className={styles.Title}>
          <Typography className={styles.TitleText}>{dataArray}</Typography>
        </div>
      );
      data = conversations[dataArray].map((conversation: any, index: number) => {
        let lastMessage = [];
        lastMessage = conversation;
        return (
          <>
            {index === 0 ? header : null}
            <ChatConversation
              key={conversation.contact.id}
              selected={props.selectedContactId === conversation.contact.id}
              onClick={(i: number) => props.setSelectedContactId(conversation.contact.id)}
              index={index}
              contactId={conversation.contact.id}
              contactName={
                conversation.contact.name ? conversation.contact.name : conversation.contact.phone
              }
              lastMessage={lastMessage}
              senderLastMessage={conversation.contact.lastMessageAt}
              contactStatus={conversation.contact.status}
              contactBspStatus={conversation.contact.bspStatus}
              highlightSearch={props.searchVal}
              messageNumber={conversation.messageNumber}
            />
          </>
        );
      });
      // Check if its not empty
      if (data.length > 0) {
        if (!conversationList) conversationList = [];
        conversationList.push(data);
      }
    });
  }

  // build the conversation list only if there are conversations
  if (!conversationList && conversations && conversations.length > 0) {
    // TODO: Need to check why test is not returing correct result
    conversationList = conversations.map((conversation: any, index: number) => {
      let lastMessage = [];
      if (conversation.messages.length > 0) {
        lastMessage = conversation.messages[0];
      }
      return (
        <ChatConversation
          key={index}
          selected={props.selectedContactId === conversation.contact.id}
          onClick={(i: number) => props.setSelectedContactId(conversation.contact.id)}
          index={index}
          contactId={conversation.contact.id}
          contactName={
            conversation.contact.name ? conversation.contact.name : conversation.contact.phone
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
    <div className={styles.ScrollToTopButton} onClick={showLatestContact}>
      Go to top <KeyboardArrowUpIcon />
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
                <div onClick={loadMoreMessages} className={styles.LoadMoreButton}>
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
