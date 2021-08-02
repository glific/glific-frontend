import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';

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
