import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, BrowserRouter as Router, Routes } from 'react-router';
import userEvent from '@testing-library/user-event';

import { Providers } from './Providers';
import { LIST_ITEM_MOCKS } from '../SettingList.test.helper';
import * as Notification from 'common/notification';
import { getProvidersQuery, getCredential } from 'mocks/Organization';
import {
  createMaytapiCredentialsMock,
  getMaytapiProvider,
  getMaytapiProviderMock,
  getSavedCredentials,
  updateMaytapiCredentials,
} from 'mocks/Organization';

const mocks = LIST_ITEM_MOCKS;
const user = userEvent.setup();

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
      user.click(checkbox);
      // click on SAVE
      const saveButton = screen.getByText('Save');
      user.click(saveButton);
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
      user.click(cancelButton);
    });
  });
});

const maytapiProvider = (error: boolean = false) => {
  let MOCKS: any = [...mocks, ...getMaytapiProviderMock, , createMaytapiCredentialsMock(error)];

  return (
    <MemoryRouter initialEntries={[`/settings/maytapi`]}>
      <MockedProvider mocks={MOCKS} addTypename={false}>
        <Routes>
          <Route path="settings/:type" element={<Providers />} />
        </Routes>
      </MockedProvider>
    </MemoryRouter>
  );
};
const gupshupProvider = () => {
  let MOCKS: any = [...getProvidersQuery, ...getCredential, ...getCredential];
  return (
    <MemoryRouter initialEntries={[`/settings/gupshup`]}>
      <MockedProvider mocks={MOCKS} addTypename={false}>
        <Routes>
          <Route path="settings/:type" element={<Providers />} />
        </Routes>
      </MockedProvider>
    </MemoryRouter>
  );
};

describe('maytapi', () => {
  test('shows confirmation modal for maytapi', async () => {
    const notificationspy = vi.spyOn(Notification, 'setNotification');
    render(maytapiProvider());

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Active?')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');

    user.click(screen.getByText('Active?'));

    fireEvent.change(inputs[0], { target: { value: 'token' } });
    fireEvent.change(inputs[1], { target: { value: 'product_id' } });

    user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
    });

    user.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(notificationspy).toHaveBeenCalled();
    });
  });

  test('testing error state when creating credentials', async () => {
    const errorMessageSpy = vi.spyOn(Notification, 'setErrorMessage');
    render(maytapiProvider(true));

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Active?')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');

    user.click(screen.getByText('Active?'));

    fireEvent.change(inputs[0], { target: { value: 'token' } });
    fireEvent.change(inputs[1], { target: { value: 'product_id' } });

    user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
    });

    user.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(errorMessageSpy).toHaveBeenCalled();
    });
  });
});

const container = (error: boolean = false) => {
  let MOCKS: any = [
    getMaytapiProvider,
    getSavedCredentials,
    getSavedCredentials,
    getSavedCredentials,
    updateMaytapiCredentials(error),
    ...mocks,
  ];
  return (
    <MemoryRouter initialEntries={[`/settings/maytapi`]}>
      <MockedProvider mocks={MOCKS} addTypename={false}>
        <Routes>
          <Route path="settings/:type" element={<Providers />} />
        </Routes>
      </MockedProvider>
    </MemoryRouter>
  );
};

describe('update credentials', () => {
  test('it should update the credentials', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
    render(container());

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Token')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Product ID')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');

    fireEvent.change(inputs[0], { target: { value: 'token2' } });
    fireEvent.change(inputs[1], { target: { value: 'product_id2' } });

    user.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
    });

    // testing if it closes the dialog box
    fireEvent.click(screen.getByTestId('cancel-button'));
    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
    });

    user.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(screen.getByText('Token')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });
  });

  test('it should throw error update credentials fail', async () => {
    const errorMessageSpy = vi.spyOn(Notification, 'setErrorMessage');

    render(container(true));

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Token')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Product ID')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');

    fireEvent.change(inputs[0], { target: { value: 'token2' } });
    fireEvent.change(inputs[1], { target: { value: 'product_id2' } });

    user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
    });

    user.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(errorMessageSpy).toHaveBeenCalled();
    });
  });
});

describe('gupshup dialog', () => {
  test('opens confirmation dialog on save', async () => {
    render(gupshupProvider());

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Active?')).toBeInTheDocument();
    });

    const saveButton = await screen.findByTestId('submitActionButton');
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
      const content = screen.getByTestId('dialog-content');
      expect(content).toHaveTextContent('Since an App ID already exists');
      expect(content).toHaveTextContent('Current App Name:');
      expect(content).toHaveTextContent('Current API Key:');
    });
  });
});
