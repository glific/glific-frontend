import { render, screen, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';

import { Providers } from './Providers';
import { LIST_ITEM_MOCKS } from '../SettingList.test.helper';

const mocks = LIST_ITEM_MOCKS;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <Providers />
    </Router>
  </MockedProvider>
);

const wrapperWithType = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <Providers />
    </Router>
  </MockedProvider>
);

describe('<Providers />', () => {
  it('renders component properly', async () => {
    const { getByText } = render(wrapper);
    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
  });
});

describe('<Providers />', () => {
  it('SAVE component properly', async () => {
    const { getByText } = render(wrapperWithType);
    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox');
      UserEvent.click(checkbox);
      // click on SAVE
      const saveButton = screen.getByText('Save');
      UserEvent.click(saveButton);
    });
  });
});

describe('<Providers />', () => {
  it('Click on Cancel button', async () => {
    const { getByText } = render(wrapperWithType);
    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      // click on Cancel
      const cancelButton = screen.getByText('Cancel');
      UserEvent.click(cancelButton);
    });
  });
});
