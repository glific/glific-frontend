import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { MockedProvider } from '@apollo/client/testing';

import { walletBalanceQuery, walletBalanceSubscription } from 'mocks/Organization';
import { Layout } from './Layout';

const mocks = [...walletBalanceQuery, ...walletBalanceSubscription];

describe('layout testing', () => {
  // it('renders the appropriate components', async () => {
  //   const { getByTestId } = render(
  //     <MockedProvider mocks={mocks}>
  //       <MemoryRouter>
  //         <Layout>Default layout</Layout>
  //       </MemoryRouter>
  //     </MockedProvider>
  //   );

  //   await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 0)));
  //   expect(getByTestId('navbar')).toBeInTheDocument();
  //   expect(getByTestId('layout')).toBeInTheDocument();
  // });
});
