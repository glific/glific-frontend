import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router';

import { SettingList } from './SettingList';
import { LIST_ITEM_MOCKS } from './SettingList.test.helper';

const mocks = LIST_ITEM_MOCKS;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <SettingList />
    </Router>
  </MockedProvider>
);

describe('<SettingList />', () => {
  it('renders component properly', async () => {
    const { getByText } = render(wrapper);
    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('Settings')).toBeInTheDocument();
    });
  });
});

describe('the web channel entry', () => {
  afterEach(() => localStorage.removeItem('organizationServices'));

  it('is absent for an organization without the feature flag', async () => {
    render(wrapper);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    expect(screen.queryByText('Web channel')).not.toBeInTheDocument();
  });

  it('sits beside the other org settings, not among the integrations, once the flag is on', async () => {
    localStorage.setItem('organizationServices', JSON.stringify({ webChannelEnabled: true }));
    render(wrapper);

    await waitFor(() => {
      expect(screen.getByText('Web channel')).toBeInTheDocument();
    });

    const tabs = screen.getByTestId('setting-drawer').textContent;
    expect(tabs?.indexOf('Web channel')).toBeGreaterThan(tabs?.indexOf('Billing') ?? 0);
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });
});
