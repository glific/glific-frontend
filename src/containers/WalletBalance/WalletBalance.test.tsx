import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import {
  errorBalanceQuery,
  trialOrganizationStatusQuery,
  nonTrialOrganizationStatusQuery,
  walletBalanceHighQuery,
  walletBalanceHighSubscription,
  walletBalanceNull,
  walletBalanceQuery,
  walletBalanceSubscription,
} from 'mocks/Organization';
import { WalletBalance } from './WalletBalance';

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
      expect(walletBalance).toHaveTextContent('Wallet balance');
    });
  });
});

describe('<WalletBalance />', () => {
  test('it should mount for full open false', async () => {
    const mocks = [...walletBalanceQuery, ...walletBalanceNull];
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
      expect(walletBalance).toHaveTextContent('$0.63');
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
      expect(walletBalance).toHaveTextContent('$10.38');
    });
  });
});

describe('<WalletBalance />', () => {
  const mocks = [...errorBalanceQuery, ...errorBalanceQuery, ...walletBalanceHighSubscription];

  test('Query returns error', async () => {
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
    });
  });
});

describe('<WalletBalance />', () => {
  const mocks = [...errorBalanceQuery, ...walletBalanceHighSubscription];

  test('Query returns error when full open', async () => {
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
    });
  });
});

describe('<WalletBalance />', () => {
  test('Query returns null balance', async () => {
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
    });
  });
});

describe('<WalletBalance /> - Trial Organization', () => {
  test('should not render for trial organization', async () => {
    const trialMocks = [...trialOrganizationStatusQuery, ...walletBalanceQuery, ...walletBalanceSubscription];

    render(
      <MockedProvider mocks={trialMocks}>
        <WalletBalance fullOpen={true} />
      </MockedProvider>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('WalletBalance')).not.toBeInTheDocument();
    });
  });

  test('should render for non-trial organization', async () => {
    const nonTrialMocks = [...nonTrialOrganizationStatusQuery, ...walletBalanceQuery, ...walletBalanceSubscription];

    render(
      <MockedProvider mocks={nonTrialMocks}>
        <WalletBalance fullOpen={true} />
      </MockedProvider>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      const walletBalance = screen.getByTestId('WalletBalance');
      expect(walletBalance).toBeInTheDocument();
      expect(walletBalance).toHaveTextContent('Wallet balance');
    });
  });
});
