import React from 'react';
import { render, waitFor } from '@testing-library/react';

import { Billing } from './Billing';
import { MockedProvider } from '@apollo/client/testing';
import { LIST_ITEM_MOCKS } from '../SettingList.test.helper';
import { BrowserRouter as Router } from 'react-router-dom';

const mocks = LIST_ITEM_MOCKS;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <Billing />
    </Router>
  </MockedProvider>
);

describe('<Billing />', () => {
  it('renders component properly', async () => {
    const { getByText } = render(wrapper);
    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('Back to settings')).toBeInTheDocument();
    });
  });
});
