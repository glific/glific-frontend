import { MemoryRouter } from 'react-router';
import { render, screen, waitFor } from '@testing-library/react';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { BSPBALANCE } from 'graphql/queries/Organization';
import { getInactiveStatusMock, getWhatsAppManagedPhonesStatusMock, orgSuspendedMock } from 'mocks/StatusBar';
import StatusBar from './StatusBar';

const cache = new InMemoryCache();

const wrapper = (bspbalance: string, mock?: any) => {
  cache.writeQuery({
    query: BSPBALANCE,
    variables: { orgId: '1' },
    data: {
      bspbalance,
    },
  });

  let MOCKS = [orgSuspendedMock];
  if (mock) {
    MOCKS = [...MOCKS, mock];
  }
  return (
    <MockedProvider cache={cache} mocks={MOCKS}>
      <MemoryRouter initialEntries={['/group/chat']}>
        <StatusBar />
      </MemoryRouter>
    </MockedProvider>
  );
};

beforeEach(() => {
  cache.reset();
});

test('it should show error message if balance is below 1', async () => {
  render(wrapper('{"balance":0.5}', getWhatsAppManagedPhonesStatusMock));

  await waitFor(() => {
    expect(screen.getByTestId('status-bar')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Please recharge your Gupshup wallet immediately to continue sending messages. Users will not receive the messages that get stuck during this time.'
      )
    ).toBeInTheDocument();
  });
});

test('it should show suspended message if balance is negative', async () => {
  render(wrapper('{"balance":-1.4}', getWhatsAppManagedPhonesStatusMock));

  await waitFor(() => {
    expect(screen.getByTestId('status-bar')).toBeInTheDocument();
    expect(
      screen.getByText(
        'All the outgoing messages have been suspended. Please note: on recharging, the messages that were stuck will not be sent.'
      )
    ).toBeInTheDocument();
  });
});

test('it should show suspended message if balance is negative', async () => {
  render(wrapper('{"balance":14.17}', getInactiveStatusMock));

  await waitFor(() => {
    expect(screen.getByTestId('status-bar')).toBeInTheDocument();
    expect(
      screen.getByText(
        'One or more of your phones are not active. Please check the Maytapi console to ensure smooth message delivery.'
      )
    ).toBeInTheDocument();
  });
});
