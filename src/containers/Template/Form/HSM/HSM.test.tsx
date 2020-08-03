import React from 'react';
import { render, wait } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

import { HSM } from './HSM';
import { Switch, Route } from 'react-router-dom';
import { HSMList } from '../../List/HSMList/HSMList';
import { TEMPLATE_MOCKS } from '../../Template.test.helper';

const mocks = TEMPLATE_MOCKS;

test('HSM form is loaded correctly in edit mode', async () => {
  const { getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Router>
        <Switch>
          <Route path="/template/add" exact component={HSMList} />
        </Switch>
        <HSM match={{ params: { id: 1 } }} />
      </Router>
    </MockedProvider>
  );
  await wait();
  expect(getByText('Edit HSM Template')).toBeInTheDocument();
});
