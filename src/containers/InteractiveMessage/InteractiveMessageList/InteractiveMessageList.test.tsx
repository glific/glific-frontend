import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';

import { filterInteractiveQuery, getInteractiveCountQuery } from 'mocks/InteractiveMessage';
import { setUserSession } from 'services/AuthService';
import InteractiveMessageList from './InteractiveMessageList';
import { getFilterTagQuery } from 'mocks/Tag';

const mocks = [
  filterInteractiveQuery,
  filterInteractiveQuery,
  getInteractiveCountQuery,
  getFilterTagQuery,
];
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

  await waitFor(() => {
    const title = screen.getByText('Interactive msg');
    const label = screen.getByText('Title');
    const messageBody = screen.getByText('Message');
    const type = screen.getByText('Type');

    expect(title).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(messageBody).toBeInTheDocument();
    expect(type).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('List')).toBeInTheDocument();
    expect(screen.getAllByText('Quick Reply')[0]).toBeInTheDocument();
  });
});
