import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { WalletBalance } from './WalletBalance';
import { MockedProvider } from '@apollo/client/testing';
import {
  walletBalanceHighQuery,
  walletBalanceHighSubscription,
  walletBalanceQuery,
  walletBalanceSubscription,
} from '../../mocks/Organization';

const mocks = [...walletBalanceQuery, ...walletBalanceSubscription];

describe('<WalletBalance />', () => {
  test('it should mount', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <WalletBalance fullOpen={true} />
      </MockedProvider>
    );
    // display initial loading
    const loading = screen.getByTestId('loading');
    expect(loading).toBeInTheDocument();

    await waitFor(() => {
      const walletBalance = screen.getByTestId('WalletBalance');
      expect(walletBalance).toBeInTheDocument();
      expect(walletBalance).toHaveTextContent('Wallet balance is low');
    });
  });
});

describe('<WalletBalance />', () => {
  const mocks = [...walletBalanceHighQuery, ...walletBalanceHighSubscription];

  test('Test:balance having more than 1', async () => {
    render(
      <MockedProvider mocks={mocks}>
        <WalletBalance fullOpen={false} />
      </MockedProvider>
    );

    // display initial loading
    const loading = screen.getByTestId('loading');
    expect(loading).toBeInTheDocument();

    await waitFor(() => {
      const walletBalance = screen.getByTestId('WalletBalance');
      expect(walletBalance).toBeInTheDocument();
      expect(walletBalance).toHaveTextContent('$10.379');
    });
  });
});
