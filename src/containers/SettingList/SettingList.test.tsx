import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router';

import { SettingList } from './SettingList';
import { LIST_ITEM_MOCKS } from './SettingList.test.helper';
import { GET_PROVIDERS } from 'graphql/queries/Organization';

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

  it('renders and converts provider name "Google sheet" to "Google Sheet"', async () => {
    const mocks = [
      {
        request: {
          query: GET_PROVIDERS,
        },
        result: {
          data: {
            providers: [
              { id: 1, name: 'Google sheet', shortcode: 'google-sheet' },
              { id: 2, name: 'BigQuery', shortcode: 'bigquery' },
            ],
          },
        },
      },
    ];

    const { getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <SettingList />
        </Router>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(getByText('Settings')).toBeInTheDocument();
    });

    expect(getByText('Google Sheet')).toBeInTheDocument();
    expect(() => getByText('Google sheet')).toThrow();
  });
});
