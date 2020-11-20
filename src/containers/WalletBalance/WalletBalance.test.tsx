import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import WalletBalance from './WalletBalance';
import { MockedProvider } from '@apollo/client/testing';
import { walletBalanceQuery, walletBalanceSubscription } from '../../mocks/Organization';

const mocks = [walletBalanceQuery, walletBalanceSubscription];

describe('<WalletBalance />', () => {
  test('it should mount', () => {
    render(
      <MockedProvider mocks={mocks}>
        <WalletBalance fullOpen={true} />
      </MockedProvider>
    );

    const walletBalance = screen.getByTestId('WalletBalance');

    expect(walletBalance).toBeInTheDocument();
  });
});
