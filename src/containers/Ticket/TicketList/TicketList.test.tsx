import { render, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';

import { setUserSession } from 'services/AuthService';
import { TicketList } from './TicketList';
import { ticketCountQuery, ticketListQuery } from 'mocks/Ticket';

const mocks = [ticketListQuery, ticketCountQuery];

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <TicketList />
    </MemoryRouter>
  </MockedProvider>
);

setUserSession(JSON.stringify({ roles: ['Admin'] }));

test('should load the trigger list', async () => {
  const { getByText } = render(wrapper);

  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Tickets')).toBeInTheDocument();
  });
});
