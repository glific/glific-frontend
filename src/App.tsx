import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { Layout } from './components/UI/Layout/Layout';
import { TagPage } from './components/pages/TagPage/TagPage';
import { Tag } from './containers/Tag/Tag';
import { DashboardPage } from './components/pages/DashboardPage/DashboardPage';

const App = () => {
  return (
    <div className="App">
      <Layout>
        <Switch>
          <Route path="/tag" exact component={TagPage} />
          <Route path="/tag/add" exact component={Tag} />
          <Route path="/tag/:id/edit" exact component={Tag} />
          <Route path="/" exact component={DashboardPage} />
        </Switch>
      </Layout>
    </div>
  );
};

export default App;
