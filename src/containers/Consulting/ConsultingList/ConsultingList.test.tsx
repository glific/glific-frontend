import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';

import { listingMock } from 'mocks/Consulting';
import { setUserSession } from 'services/AuthService';
import ConsultingList from './ConsultingList';

const mocks = listingMock;

setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const list = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <ConsultingList />
    </Router>
  </MockedProvider>
);

it('Renders ConsultingList component successfully', async () => {
  render(list);

  expect(screen.getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    const nameLabel = screen.getByText('NAME');
    const dateLabel = screen.getByText('DATE');
    const minutesLabel = screen.getByText('MINUTES');
    const typeLabel = screen.getByText('TYPE');
    const actionLabel = screen.getByText('ACTIONS');

    expect(nameLabel).toBeInTheDocument();
    expect(dateLabel).toBeInTheDocument();
    expect(minutesLabel).toBeInTheDocument();
    expect(typeLabel).toBeInTheDocument();
    expect(actionLabel).toBeInTheDocument();
  });
});
