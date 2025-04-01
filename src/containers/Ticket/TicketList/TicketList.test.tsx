import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';

import { setUserSession } from 'services/AuthService';
import { TicketList } from './TicketList';
import {
  closedTicketCountQuery,
  closedTicketListQuery,
  getTicketQuery,
  myTicketsCountQuery,
  myTicketsListQuery,
  ticketCountQuery,
  ticketListQuery,
} from 'mocks/Ticket';
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
  closedTicketListQuery,
  closedTicketCountQuery,
  myTicketsListQuery,
  myTicketsCountQuery,
];

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <TicketList />
    </MemoryRouter>
  </MockedProvider>
);

window.open = vi.fn();
setUserSession(JSON.stringify({ roles: ['Admin'], id: '1', name: 'NGO Main Account' }));

test('should load the ticket list', async () => {
  const { getByText, getByTestId } = render(wrapper);

  expect(getByTestId('loading')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Tickets')).toBeInTheDocument();
    expect(getByText('field name')).toBeInTheDocument();
  });
});

test('it should render closed tickets', async () => {
  render(wrapper);

  expect(screen.getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Tickets')).toBeInTheDocument();
  });

  const autocomplete = screen.getAllByRole('combobox')[0];
  autocomplete.focus();
  fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });

  fireEvent.click(screen.getByText('Closed'), { key: 'Enter' });
  await waitFor(() => {
    expect(screen.getByText('I want to know how to submit activity')).toBeInTheDocument();
  });
});

test('it should render my tickets', async () => {
  render(wrapper);

  expect(screen.getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Tickets')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('My tickets'));

  await waitFor(() => {
    // expect(screen.getByText('what is an interactive message?')).toBeInTheDocument();
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

test('it should go to chats page', async () => {
  const { getByText, getByTestId, getAllByTestId } = render(wrapper);
  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Tickets')).toBeInTheDocument();
  });

  fireEvent.click(getAllByTestId('chat-icon')[0]);
  await waitFor(() => {
    expect(window.open).toHaveBeenCalledWith('chat/1?search=23');
  });

  fireEvent.click(getAllByTestId('chat-icon')[1]);
  await waitFor(() => {
    expect(window.open).toHaveBeenCalledWith('chat/2');
  });
});
