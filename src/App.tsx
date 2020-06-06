import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';

import { Layout } from './components/UI/Layout/Layout';
import { TagPage } from './components/pages/TagPage/TagPage';
import { Tag } from './containers/Tag/Tag';
import { DashboardPage } from './components/pages/DashboardPage/DashboardPage';
import styles from './App.module.css';

const App = () => {
  return (
    <div className="App">
      <Layout>
        {/* <header className={styles.Navigationbar}>
          <h1>Glific</h1>
          <nav>
            <ul className={styles.NavigationItems}>
              <li className={styles.NavigationItem}>
                <Link to="/">Dashboard</Link>
              </li>
              <li className={styles.NavigationItem}>
                <Link to="/tag">Tags</Link>
              </li>
              <li className={styles.NavigationItem}>
                <Link to="/logout">Logout</Link>
              </li>
            </ul>
          </nav>
        </header>
        <div className={styles.Content}>
          <Switch>
            <Route path="/tag" exact component={TagPage} />
            <Route path="/tag/add" exact component={Tag} />
            <Route path="/tag/:id/edit" exact component={Tag} />
            <Route path="/" exact component={DashboardPage} />
          </Switch>
        </div> */}
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
