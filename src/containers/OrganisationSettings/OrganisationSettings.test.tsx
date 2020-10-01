import React from 'react';
import { render, screen, fireEvent, wait } from '@testing-library/react';
import { OrganisationSettings } from './OrganisationSettings';
import { MockedProvider } from '@apollo/client/testing';
import { LIST_ITEM_MOCKS } from './OrganisationSettings.test.helper';
import { BrowserRouter as Router } from 'react-router-dom';

const mocks = LIST_ITEM_MOCKS;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <OrganisationSettings />
    </Router>
  </MockedProvider>
);

describe('<OrganisationSettings />', () => {
  it('renders component properly', async () => {
    const { getByText } = render(wrapper);
    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await wait();
    expect(getByText('Settings')).toBeInTheDocument();
  });
});
