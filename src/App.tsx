import React from 'react';
import { Switch, Route, RouteComponentProps, Redirect } from 'react-router-dom';
import './assets/fonts/fonts.css';
import { Layout } from './components/UI/Layout/Layout';
import { Tag } from './containers/Tag/Tag';
import { TagPage } from './components/pages/TagPage/TagPage';
import Chat from './containers/Chat/Chat';
import styles from './App.module.css';

const App = () => {
  const defaultRedirect = () => <Redirect to="/chat" />;

  return (
    <div className={styles.App}>
      <Layout>
        <Switch>
          <Route path="/tag" exact component={TagPage} />
          <Route path="/tag/add" exact component={Tag} />
          <Route path="/tag/:id/edit" exact component={Tag} />
          {/* Doesn't this error without a passed in `contactId`? */}
          <Route path="/chat" exact component={Chat} />
          <Route
            exact
            path="/chat/:contactId"
            component={({ match }: RouteComponentProps<{ contactId: string }>) => (
              <Chat contactId={match.params.contactId} />
            )}
          />
        </Switch>
        <Route exact path="/" render={defaultRedirect} />
      </Layout>
    </div>
  );
};

export default App;
