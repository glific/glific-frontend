import React from 'react';
import { Switch, RouteComponentProps, Redirect, Route } from 'react-router-dom';
import './assets/fonts/fonts.css';
import { Layout } from './components/UI/Layout/Layout';
import { Tag } from './containers/Tag/Tag';
import { TagPage } from './components/pages/TagPage/TagPage';
// import ChatPage from './components/pages/ChatPage/ChatPage';
import { Registration } from './components/pages/Registration/Registration';
import { ConfirmOTP } from './components/pages/ConfirmOTP/ConfirmOTP';
import { Login } from './components/pages/Login/Login';
import MessageTemplatePage from './components/pages/MessageTemplatePage/MessageTemplatePage';
import { MessageTemplate } from './containers/MessageTemplate/MessageTemplate';
import Chat from './containers/Chat/Chat';
import styles from './App.module.css';
import { ProtectedRoute } from './common/ProtectedRoute';
import gqlClient from './config/apolloclient';
import { useCookies } from 'react-cookie';

import { ApolloProvider } from '@apollo/client';
const App = () => {
  const defaultRedirect = () => <Redirect to="/chat" />;
  const [cookies] = useCookies(['session']);
  const client = cookies.session
    ? gqlClient(cookies.session.data.data.access_token)
    : gqlClient(null);

  return (
    <ApolloProvider client={client}>
      <Switch>
        <Route path="/login" exact component={Login} />
        <Route path="/registration" exact component={Registration} />
        <Route path="/confirmotp" exact component={ConfirmOTP} />
        <Route path="/">
          <div className={styles.App}>
            <Layout>
              <Switch>
                <ProtectedRoute path="/tag" exact component={TagPage} />
                <ProtectedRoute path="/tag/add" exact component={Tag} />
                <ProtectedRoute path="/tag/:id/edit" exact component={Tag} />
                {/* Doesn't this error without a passed in `contactId`? */}

                <ProtectedRoute path="/speed-send" exact component={MessageTemplatePage} />
                <ProtectedRoute path="/speed-send/add" exact component={MessageTemplate} />
                <ProtectedRoute path="/speed-send/:id/edit" exact component={MessageTemplate} />
                <ProtectedRoute path="/chat" exact component={Chat} />
                {/* This part isn't working properly */}
                <ProtectedRoute
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
        </Route>
      </Switch>
    </ApolloProvider>
  );
};

export default App;
