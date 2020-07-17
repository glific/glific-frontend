import React from 'react';
import { render, wait, screen, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { MessageTemplateList } from './MessageTemplateList';
import { Switch, Route } from 'react-router-dom';
import { within, fireEvent } from '@testing-library/dom';
import { MessageTemplate } from '../MessageTemplate';
import { TEMPLATE_MOCKS } from './MessageTemplateList.test.helper';

afterEach(cleanup);
const mocks = TEMPLATE_MOCKS;

const messageTemplate = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <MessageTemplateList />
    </Router>
  </MockedProvider>
);

test('MessageTemplateList has proper headers', async () => {
  const { container } = render(messageTemplate);

  await wait();
  const { getByText } = within(container.querySelector('thead'));
  expect(getByText('LABEL')).toBeInTheDocument();
  expect(getByText('BODY')).toBeInTheDocument();
  expect(getByText('ACTIONS')).toBeInTheDocument();
});

const messageTemplateButtons = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <Switch>
        <Route path="/speed-send/add" exact component={MessageTemplate} />
      </Switch>
      <MessageTemplateList />
    </Router>
  </MockedProvider>
);

test('edit Button contains a route to edit page', async () => {
  const { container } = render(messageTemplateButtons);
  await wait();
  expect(container.querySelector('tbody tr a').getAttribute('href')).toBe('/speed-send/87/edit');
});
