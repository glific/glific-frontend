import React from 'react';
import { Switch, Route, RouteComponentProps, Redirect } from 'react-router-dom';

import { Layout } from './components/UI/Layout/Layout';
import { Tag } from './containers/Tag/Tag';
import { TagPage } from './components/pages/TagPage/TagPage';
import { DashboardPage } from './components/pages/DashboardPage/DashboardPage';
import ChatPage from './components/pages/ChatPage/ChatPage';
import styles from './App.module.css';

const App = () => {
  const defaultRedirect = () => <Redirect to="/" />;

  return (
    <div className={styles.App}>
      <Layout>
        <Switch>
          <Route path="/tag" exact component={TagPage} />
          <Route path="/tag/add" exact component={Tag} />
          <Route path="/tag/:id/edit" exact component={Tag} />
          <Route path="/chat" exact component={ChatPage} />
          <Route
            exact
            path="/chat/:chatId"
            component={({ match }: RouteComponentProps<{ chatId: string }>) => (
              <ChatPage chatId={match.params.chatId} />
            )}
          />
          <Route path="/" exact component={DashboardPage} />
        </Switch>
        <Route exact path="/" render={defaultRedirect} />
      </Layout>
    </div>
  );
};

export default App;
