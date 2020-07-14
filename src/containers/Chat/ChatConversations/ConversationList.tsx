import React, { useCallback, useEffect } from 'react';
import { List, Container } from '@material-ui/core';
import ChatConversation from './ChatConversation/ChatConversation';
import styles from './ChatConversations.module.css';
import Loading from '../../../components/UI/Layout/Loading/Loading';
import { GET_CONVERSATION_QUERY, FILTER_CONVERSATIONS_QUERY } from '../../../graphql/queries/Chat';
import { useApolloClient, useLazyQuery, useQuery } from '@apollo/client';

interface ConversationListProps {
  searchVal: string;
  selectedIndex: number;
  setSelectedIndex: (i: number) => void;
}

export const ConversationList: React.SFC<ConversationListProps> = (props) => {
  const client = useApolloClient();
  const queryVariables = {
    contactOpts: {
      limit: 50,
    },
    filter: {},
    messageOpts: {
      limit: 100,
    },
  };
  const filterVariables = () => {
    return {
      term: props.searchVal,
      messageOpts: {
        limit: 10,
      },
      contactOpts: {
        limit: 10,
      },
    };
  };

  const data: any = client.readQuery({
    query: GET_CONVERSATION_QUERY,
    variables: queryVariables,
  });

  const [
    getFilterConvos,
    { called, loading, error, data: searchData, refetch, fetchMore, updateQuery },
  ] = useLazyQuery<any>(FILTER_CONVERSATIONS_QUERY, {
    variables: filterVariables(),
  });

  useEffect(() => {
    props.setSelectedIndex(-1);
    // if (refetch) {
    //   console.log('i found refetch');
    // }
    // if (fetchMore) {
    //   console.log('i found fetchmore');
    //   fetchMore({
    //     query: FILTER_CONVERSATIONS_QUERY,
    //     variables: filterVariables(),
    //     updateQuery: (prev, { fetchMoreResult }) => {
    //       return fetchMoreResult;
    //       // return getNewSearch(prev, fetchMoreResult);
    //     },
    //   });
    // }
  });

  // const getNewSearch = useCallback((prevResult: any, newData: any) => {
  //   console.log(prevResult);
  //   console.log(newData);
  //   return newData.search;
  // }, []);

  // Other cases
  if (called && loading) return <Loading />;
  if (called && error) return <p>Error :(</p>;

  if (data === undefined) {
    return <p>Error :(</p>;
  }

  // Retrieving all convos or the ones searched by.
  let conversations = data.conversations;

  if (props.searchVal && !called) {
    getFilterConvos();
  }

  if (called && props.searchVal !== '') {
    conversations = searchData.search.filter((n: any) => n.__typename === 'Conversation'); // Trying to only get conversation types from search query.
  }

  // build the conversation list only if there are conversations
  let conversationList;
  if (conversations.length > 0) {
    conversationList = conversations.map((conversation: any, index: number) => {
      let lastMessage = [];
      if (conversation.messages.length > 0) {
        lastMessage = conversation.messages[0];
      }
      return (
        <ChatConversation
          key={conversation.contact.id}
          selected={props.selectedIndex === index}
          onClick={(i: number) => props.setSelectedIndex(i)}
          index={index}
          contactId={conversation.contact.id}
          contactName={
            conversation.contact.name ? conversation.contact.name : conversation.contact.phone
          }
          lastMessage={lastMessage}
        />
      );
    });
  } else {
    conversationList = <p data-testid="empty-result">You do not have any conversations.</p>;
  }

  return (
    <Container className={styles.ListingContainer} disableGutters>
      {conversationList ? (
        <List className={styles.StyledList}>{conversationList}</List>
      ) : (
        { conversationList }
      )}
    </Container>
  );
};
