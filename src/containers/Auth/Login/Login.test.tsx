import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

import {
  getCurrentUserQuery,
  getCurrentUserErrorQuery,
  getCurrentUserInvalidRoleQuery,
} from 'mocks/User';

import { getOrganizationServicesQuery, getOrganizationStatus } from 'mocks/Organization';
import { setErrorMessage } from 'common/notification';

import { Login } from './Login';

const mocks = [getCurrentUserQuery, getOrganizationServicesQuery, getOrganizationStatus('ACTIVE')];

vi.mock('axios');
vi.mock('pino-logflare', () => ({
  createWriteStream: vi.fn(),
  createPinoBrowserSend: vi.fn(),
}));
const mockedAxios = axios as any;
vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setErrorMessage: vi.fn((...args) => {
      return args[1];
    }),
  };
});

const wrapper = (mocks: any) => (
  <MockedProvider mocks={mocks}>
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  </MockedProvider>
);

const userAction = async (container: any) => {
  const user = userEvent.setup();
  const phone = container.querySelector('input[type="tel"]') as HTMLInputElement;
  await user.click(phone);
  await user.keyboard('+919978776554');

  const password = container.querySelector('input[type="password"]') as HTMLInputElement;
  await user.click(password);
  await user.keyboard('pass123456');

  // click on login
  const loginButton = screen.getByText('Login');
  user.click(loginButton);
};

describe('<Login />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders component properly', async () => {
    // let's mock successful registration submission
    const responseData = { data: { data: { data: {} } } };

    const successPromise = vi.fn(() => Promise.resolve(responseData));
    mockedAxios.post.mockImplementation(() => successPromise());
    const { findByTestId } = render(wrapper(mocks));
    const authContainer = await findByTestId('AuthContainer');
    expect(authContainer).toHaveTextContent('Login to your account');
  });

  it('test the login form submission with correct creds', async () => {
    // let's mock successful registration submission
    const responseData = { data: { data: { data: {} } } };

    // setAuthToken uses localStorage.setItem
    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');

    const successPromise = vi.fn(() => Promise.resolve(responseData));
    mockedAxios.post.mockImplementation(() => successPromise());
    const { container } = render(wrapper(mocks));

    await userAction(container);

    await waitFor(() => {
      expect(successPromise).toHaveBeenCalled();
      expect(localStorageSpy).toHaveBeenCalled();
    });
  });

  it('test the login form submission with incorrect creds', async () => {
    // set the mock error case while login
    const errorMessage = 'Cannot login';
    const rejectPromise = vi.fn(() => Promise.reject(errorMessage));
    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
    mockedAxios.post.mockImplementationOnce(() => rejectPromise());
    const { container } = render(wrapper(mocks));

    await userAction(container);

    await waitFor(() => {
      expect(rejectPromise).toHaveBeenCalled();
      expect(localStorageSpy).not.toHaveBeenCalled();
    });
  });

  it('test the login form submission with error', async () => {
    // let's mock successful registration submission
    const responseData = { data: { data: { data: {} } } };

    const successPromise = vi.fn(() => Promise.resolve(responseData));
    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
    mockedAxios.post.mockImplementationOnce(() => successPromise());
    const { container } = render(
      <MockedProvider mocks={[getCurrentUserErrorQuery, getOrganizationServicesQuery]}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </MockedProvider>
    );

    await userAction(container);

    await waitFor(() => {
      expect(successPromise).toHaveBeenCalled();
      expect(localStorageSpy).not.toHaveBeenCalled();
    });
  });

  it('test the login form submission with error(invalid role)', async () => {
    // let's mock successful registration submission
    const responseData = { data: { data: { data: {} } } };

    const successPromise = vi.fn(() => Promise.resolve(responseData));
    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
    mockedAxios.post.mockImplementationOnce(() => successPromise());
    const { container } = render(
      <MockedProvider mocks={[getCurrentUserInvalidRoleQuery]}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </MockedProvider>
    );

    await userAction(container);

    await waitFor(() => {
      expect(successPromise).toHaveBeenCalled();
      expect(localStorageSpy).not.toHaveBeenCalled();
    });
  });

  it('test popup if org is force suspended', async () => {
    const responseData = { data: { data: { data: {} } } };

    // setAuthToken uses localStorage.setItem
    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');

    const successPromise = vi.fn(() => Promise.resolve(responseData));
    mockedAxios.post.mockImplementation(() => successPromise());

    const { container } = render(
      wrapper([
        getCurrentUserQuery,
        getCurrentUserQuery,
        getOrganizationServicesQuery,
        getOrganizationStatus('FORCED_SUSPENSION'),
      ])
    );
    await userAction(container);

    await waitFor(() => {
      expect(setErrorMessage).toHaveBeenCalled();
    });
  });

  it('test popup if org is suspended', async () => {
    const responseData = { data: { data: { data: {} } } };

    // setAuthToken uses localStorage.setItem
    const successPromise = vi.fn(() => Promise.resolve(responseData));
    mockedAxios.post.mockImplementation(() => successPromise());

    const { container } = render(
      wrapper([
        getCurrentUserQuery,
        getCurrentUserQuery,
        getOrganizationServicesQuery,
        getOrganizationStatus('SUSPENDED'),
      ])
    );
    await userAction(container);

    await waitFor(() => {
      expect(setErrorMessage).toHaveBeenCalled();
    });
  });
});
