import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { Providers } from './Providers';
import { LIST_ITEM_MOCKS } from '../SettingList.test.helper';
import * as Notification from 'common/notification';

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

describe('maytapi', () => {
  test('shows confirmation modal for maytapi', async () => {
    const notificationspy = vi.spyOn(Notification, 'setNotification');
    render(
      <MemoryRouter initialEntries={[`/settings/maytapi`]}>
        <MockedProvider mocks={mocks} addTypename={false}>
          <Routes>
            <Route path="settings/:type" element={<Providers />} />
          </Routes>
        </MockedProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Active?')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');

    fireEvent.click(screen.getByText('Active?'));

    fireEvent.change(inputs[0], { target: { value: 'token' } });
    fireEvent.change(inputs[1], { target: { value: 'product_id' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(notificationspy).toHaveBeenCalled();
    });
  });
});
