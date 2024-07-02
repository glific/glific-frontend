import 'mocks/matchMediaMock';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';

import { setUserSession } from 'services/AuthService';
import { TicketList } from './TicketList';
import { getTicketQuery, ticketCountQuery, ticketListQuery } from 'mocks/Ticket';
import { getUsersQuery } from 'mocks/User';
import { getAllFlowLabelsQuery } from 'mocks/Flow';

const mocks = [
  ticketListQuery,
  ticketCountQuery,
  getUsersQuery,
  ticketListQuery,
  ticketCountQuery,
  getTicketQuery,
  getAllFlowLabelsQuery,
];

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

test('it should edit', async () => {
  const { getByText, getByTestId, getAllByTestId } = render(wrapper);

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Tickets')).toBeInTheDocument();
  });

  fireEvent.click(getAllByTestId('edit-icon')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
  });
});

test('it should click on export', async () => {
  const { getByText, getByTestId, getAllByText } = render(wrapper);

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Tickets')).toBeInTheDocument();
  });

  fireEvent.click(getAllByText('Export')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
  });
});

test('it should click on bulk update', async () => {
  const { getByText, getByTestId } = render(wrapper);

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Tickets')).toBeInTheDocument();
  });

  fireEvent.click(getByText('Bulk Update'));

  await waitFor(() => {
    expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
  });
});
