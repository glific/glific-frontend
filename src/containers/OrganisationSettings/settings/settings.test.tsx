import React from 'react';
import { render, screen, fireEvent, wait } from '@testing-library/react';
import { Settings } from './settings';
import { MockedProvider } from '@apollo/client/testing';
import { LIST_ITEM_MOCKS } from '../OrganisationSettings.test.helper';
import { BrowserRouter as Router } from 'react-router-dom';

const mocks = LIST_ITEM_MOCKS;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <Settings match={{ params: { id: 1 } }} />
    </Router>
  </MockedProvider>
);

describe('<settings />', () => {
  it('renders component properly', async () => {
    const { getByText } = render(wrapper);
    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await wait();
    expect(getByText('Back to settings')).toBeInTheDocument();
  });
});
