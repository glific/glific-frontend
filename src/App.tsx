import React, { useState } from 'react';
import { Switch, RouteComponentProps, Redirect, Route } from 'react-router-dom';
import './assets/fonts/fonts.css';
import { Layout } from './components/UI/Layout/Layout';
import { Tag } from './containers/Tag/Tag';
import { TagPage } from './components/pages/TagPage/TagPage';
import { Registration } from './components/pages/Registration/Registration';
import { ConfirmOTP } from './components/pages/ConfirmOTP/ConfirmOTP';
import { Login } from './components/pages/Login/Login';
import MessageTemplatePage from './components/pages/MessageTemplatePage/MessageTemplatePage';
import { MessageTemplate } from './containers/MessageTemplate/MessageTemplate';
import Chat from './containers/Chat/Chat';
import styles from './App.module.css';
import gqlClient from './config/apolloclient';
import { ApolloProvider } from '@apollo/client';
import { SessionContext } from './context/session';

const App = () => {
  const session = localStorage.getItem('session');
  const [authenticated, setAuthenticated] = useState(session ? true : false);

  const values = {
    authenticated: authenticated,
    setAuthenticated: (value: any) => {
      setAuthenticated(value);
    },
  };

  const accessToken = session ? JSON.parse(session).access_token : null;
  const defaultRedirect = () => <Redirect to="/chat" />;
  const client = authenticated ? gqlClient(accessToken) : gqlClient(null);
  let routes;

  if (authenticated) {
    routes = (
      <div className={styles.App}>
        <Layout>
          <Switch>
            <Route path="/tag" exact component={TagPage} />
            <Route path="/tag/add" exact component={Tag} />
            <Route path="/tag/:id/edit" exact component={Tag} />
            {/* Doesn't this error without a passed in `contactId`? */}

            <Route path="/speed-send" exact component={MessageTemplatePage} />
            <Route path="/speed-send/add" exact component={MessageTemplate} />
            <Route path="/speed-send/:id/edit" exact component={MessageTemplate} />
            <Route path="/chat" exact component={Chat} />
            {/* This part isn't working properly */}
            <Route
              exact
              path="/chat/:contactId"
              component={({ match }: RouteComponentProps<{ contactId: any }>) => (
                <Chat contactId={match.params.contactId} />
              )}
            />
            <Route path="/" render={defaultRedirect} />
          </Switch>
        </Layout>
      </div>
    );
  } else {
    routes = (
      <Switch>
        <Route path="/login" exact component={Login} />
        <Route path="/registration" exact component={Registration} />
        <Route path="/confirmotp" exact component={ConfirmOTP} />
        <Route path="/" render={() => <Redirect to="/login" />} />
      </Switch>
    );
  }

  return (
    <SessionContext.Provider value={values}>
      <ApolloProvider client={client}>{routes}</ApolloProvider>
    </SessionContext.Provider>
  );
};

export default App;
