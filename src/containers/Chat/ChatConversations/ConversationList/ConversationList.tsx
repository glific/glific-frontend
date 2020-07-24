import React, { useLayoutEffect, useRef } from 'react';
import { List, Container } from '@material-ui/core';
import ChatConversation from '../ChatConversation/ChatConversation';
import styles from './ConversationList.module.css';
import Loading from '../../../../components/UI/Layout/Loading/Loading';
import { GET_CONVERSATION_QUERY } from '../../../../graphql/queries/Chat';
import { useApolloClient, useLazyQuery } from '@apollo/client';
import { setErrorMessage } from '../../../../common/notification';
import { SEARCH_QUERY } from '../../../../graphql/queries/Search';

interface ConversationListProps {
  searchVal: string;
  selectedContactId: number;
  setSelectedContactId: (i: number) => void;
}

export const ConversationList: React.SFC<ConversationListProps> = (props) => {
  const client = useApolloClient();
  const firstUpdate = useRef(true);
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
      filter: {},
    };
  };

  const data: any = client.readQuery({
    query: GET_CONVERSATION_QUERY,
    variables: queryVariables,
  });

  const [getFilterConvos, { called, loading, error, data: searchData }] = useLazyQuery<any>(
    SEARCH_QUERY,
    {
      variables: filterVariables(),
    }
  );

  useLayoutEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    props.setSelectedContactId(-1);
  }, [props.searchVal]);

  // Other cases
  if (called && loading) return <Loading />;
  if (called && error) {
    setErrorMessage(client, error);
    return null;
  }

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
          selected={props.selectedContactId === conversation.contact.id}
          onClick={(i: number) => props.setSelectedContactId(conversation.contact.id)}
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

export default ConversationList;
