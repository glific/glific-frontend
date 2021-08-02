import { fireEvent, render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';

import { filterInteractiveQuery, getInteractiveCountQuery } from 'mocks/InteractiveMessage';
import { setUserSession } from 'services/AuthService';
import InteractiveMessageList from './InteractiveMessageList';

const mocks = [filterInteractiveQuery, filterInteractiveQuery, getInteractiveCountQuery];
setUserSession(JSON.stringify({ roles: ['Admin'] }));

const list = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <InteractiveMessageList />
    </Router>
  </MockedProvider>
);

test('Interactive message list renders correctly', async () => {
  render(list);
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  const title = await screen.findByText('Interactive msg');
  const label = await screen.findByText('TITLE');
  const messageBody = await screen.findByText('MESSAGE');
  const type = await screen.findByText('TYPE');

  expect(title).toBeInTheDocument();
  expect(label).toBeInTheDocument();
  expect(messageBody).toBeInTheDocument();
  expect(type).toBeInTheDocument();

  const [listTemplate, , imageTemplate] = await screen.findAllByRole('button', {
    name: 'DownArrow.svg',
  });
  expect(listTemplate).toBeInTheDocument();
  expect(imageTemplate).toBeInTheDocument();
  fireEvent.click(listTemplate);
  fireEvent.click(imageTemplate);
});
