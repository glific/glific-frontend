import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';

import TagPage from './components/pages/TagPage/TagPage';
import DashboardPage from './components/pages/DashboardPage/DashboardPage';

const App = () => {
  return (
    <div className="App">
      <h1>Welcome to Glific</h1>
      <nav>
        <ul>
          <li>
            <Link to="/">Dashboard</Link>
          </li>
          <li>
            <Link to="/tag">Tags</Link>
          </li>
        </ul>
      </nav>
      <Switch>
        <Route path="/tag" exact component={TagPage} />
        <Route path="/" exact component={DashboardPage} />
      </Switch>
    </div>
  );
};

export default App;
