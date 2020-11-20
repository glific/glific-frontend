import React from 'react';
import { render } from '@testing-library/react';

import { Layout } from './Layout';
import { MemoryRouter } from 'react-router';
import { MockedProvider } from '@apollo/client/testing';
import { walletBalanceQuery, walletBalanceSubscription } from '../../../mocks/Organization';

const mocks = [...walletBalanceQuery, ...walletBalanceSubscription];

describe('layout testing', () => {
  it('renders the appropriate components', () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks}>
        <MemoryRouter>
          <Layout>Default layout</Layout>
        </MemoryRouter>
      </MockedProvider>
    );
    expect(getByTestId('navbar')).toBeInTheDocument();
    expect(getByTestId('layout')).toBeInTheDocument();
  });
});
