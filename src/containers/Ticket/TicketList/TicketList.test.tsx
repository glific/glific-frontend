import { render, waitFor } from '@testing-library/react';
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

test('should load the ticket list', async () => {
  const { getByText, getByTestId } = render(wrapper);

  expect(getByTestId('loading')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Tickets')).toBeInTheDocument();
  });
});
