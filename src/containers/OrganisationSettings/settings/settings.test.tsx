import React from 'react';
import { render, screen, fireEvent, wait } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
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

describe('<settings />', () => {
  it('SAVE component properly', async () => {
    const wrapper = (
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <Settings match={{ params: { type: 'gupshup' } }} />
        </Router>
      </MockedProvider>
    );
    const { getByText } = render(wrapper);
    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await wait();
    // click on SAVE
    const saveButton = screen.getByText('Save');
    UserEvent.click(saveButton);
    await wait();
    expect(getByText('Settings edited successfully!')).toBeInTheDocument();
  });
});

describe('<settings />', () => {
  it('Click on Cancel button', async () => {
    const wrapper = (
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <Settings match={{ params: { type: 'gupshup' } }} />
        </Router>
      </MockedProvider>
    );
    const { getByText } = render(wrapper);
    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await wait();
    // click on Cancel
    const cancelButton = screen.getByText('Cancel');
    UserEvent.click(cancelButton);
  });
});
