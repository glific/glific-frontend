import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { MockedProvider } from '@apollo/client/testing';

import { walletBalanceQuery, walletBalanceSubscription } from 'mocks/Organization';
import { Layout } from './Layout';

const mocks = [...walletBalanceQuery, ...walletBalanceSubscription];

describe('layout testing', () => {
  it('renders the appropriate components', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks}>
        <MemoryRouter>
          <Layout>Default layout</Layout>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(getByTestId('navbar')).toBeInTheDocument();
      expect(getByTestId('layout')).toBeInTheDocument();
    });
  });

  it('changes the drawer state on click', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={mocks}>
        <MemoryRouter>
          <Layout>Default layout</Layout>
        </MemoryRouter>
      </MockedProvider>
    );
    fireEvent.click(getByTestId('menu-icon'));

    // Todo: add an assertion here
  });
});
