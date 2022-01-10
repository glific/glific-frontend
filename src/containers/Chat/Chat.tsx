import Loading from 'components/UI/Layout/Loading/Loading';

import React, { useState } from 'react';
import { Route, Switch, RouteComponentProps } from 'react-router-dom';
import ChatInterface from './ChatInterface/ChatInterface';
import ChatSubscription from './ChatSubscription/ChatSubscription';

export interface ChatProps {
  contactId?: number | string | null;
  collectionId?: number | null;
  savedSearches?: boolean;
}

const routes = (
  <Switch>
    <Route exact path="/chat/collection" component={() => <ChatInterface collectionId={-1} />} />
    <Route exact path="/chat/saved-searches/" component={() => <ChatInterface savedSearches />} />
    <Route
      exact
      path="/chat/saved-searches/:contactId"
      component={({ match }: RouteComponentProps<{ contactId: any }>) => (
        <ChatInterface savedSearches contactId={match.params.contactId} />
      )}
    />
    <Route
      exact
      path="/chat/:contactId"
      component={({ match }: RouteComponentProps<{ contactId: any }>) => (
        <ChatInterface contactId={match.params.contactId} />
      )}
    />
    <Route
      exact
      path="/chat/collection/:collectionId"
      component={({ match }: RouteComponentProps<{ collectionId: any }>) => (
        <ChatInterface collectionId={match.params.collectionId} />
      )}
    />
    <Route exact path="/chat" component={() => <ChatInterface />} />
  </Switch>
);

export const Chat: React.SFC<ChatProps> = () => {
  const [loaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <ChatSubscription setDataLoaded={setDataLoaded} setLoading={setLoading} />
      {loading ? <Loading /> : loaded && routes}
    </>
  );
};

export default Chat;
