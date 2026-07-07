import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import axios from 'axios';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

import * as Notification from 'common/notification';
import { ORGANIZATION_NAME, USER_SESSION } from 'config';
import setLogs from 'config/logs';
import { getCurrentUserQuery, getCurrentUserErrorQuery, getCurrentUserInvalidRoleQuery } from 'mocks/User';

import { getOrganizationServicesQuery, getOrganizationStatus } from 'mocks/Organization';

import { Login } from './Login';

const mocks = [getCurrentUserQuery, getOrganizationServicesQuery, getOrganizationStatus('ACTIVE')];

const { mockPosthogCapture, mockPosthogIdentify, mockPosthogGroup } = vi.hoisted(() => ({
  mockPosthogCapture: vi.fn(),
  mockPosthogIdentify: vi.fn(),
  mockPosthogGroup: vi.fn(),
}));

vi.mock('axios');
vi.mock('pino-logflare', () => ({
  createWriteStream: vi.fn(),
  createPinoBrowserSend: vi.fn(),
}));
vi.mock('@posthog/react', () => ({
  usePostHog: () => ({
    capture: mockPosthogCapture,
    identify: mockPosthogIdentify,
    group: mockPosthogGroup,
  }),
}));
vi.mock('config/logs', () => ({
  default: vi.fn(),
}));

const mockedAxios = axios as any;
const mockedSetLogs = vi.mocked(setLogs);

const orgNameResponse = { data: { data: { name: 'Glific', status: 'ACTIVE' } } };
const loginSuccessResponse = { data: { data: { data: {} } } };

const mockAxiosPost = (loginResult: 'success' | 'reject', payload?: unknown) => {
  mockedAxios.post.mockImplementation((url: string) => {
    if (url === ORGANIZATION_NAME) {
      return Promise.resolve(orgNameResponse);
    }
    if (url === USER_SESSION) {
      return loginResult === 'success' ? Promise.resolve(payload ?? loginSuccessResponse) : Promise.reject(payload);
    }
    return Promise.resolve({ data: { data: {} } });
  });
};

const wrapper = (mocks: any, initialEntry?: { pathname: string; state?: { to?: string } }) => (
  <MockedProvider mocks={mocks}>
    <MemoryRouter initialEntries={initialEntry ? [initialEntry] : undefined}>
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
  await user.click(loginButton);
};

describe('<Login />', () => {
  const originalLocation = window.location;
  let locationReplaceMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();
    locationReplaceMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { ...originalLocation, replace: locationReplaceMock },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: originalLocation,
    });
  });

  it('renders component properly', async () => {
    mockAxiosPost('success');
    const { findByTestId } = render(wrapper(mocks));
    const authContainer = await findByTestId('AuthContainer');
    expect(authContainer).toHaveTextContent('Login to your account');
  });

  it('test the login form submission with correct creds', async () => {
    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
    mockAxiosPost('success');
    const { container } = render(wrapper(mocks));

    await userAction(container);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(USER_SESSION, expect.any(Object));
      expect(localStorageSpy).toHaveBeenCalled();
    });
  });

  it('identifies user and organization group in PostHog on successful login', async () => {
    mockAxiosPost('success');
    const { container } = render(wrapper(mocks));

    await userAction(container);

    await waitFor(() => {
      expect(mockPosthogIdentify).toHaveBeenCalledWith('1', { access_roles: ['Admin'] });
      expect(mockPosthogGroup).toHaveBeenCalledWith('organization', '1');
      expect(mockPosthogCapture).toHaveBeenCalledWith('user_logged_in');
    });
  });

  it('redirects with window.location.replace to /chat after successful login', async () => {
    mockAxiosPost('success');
    const { container } = render(wrapper(mocks));

    await userAction(container);

    await waitFor(() => {
      expect(locationReplaceMock).toHaveBeenCalledWith('/chat');
    });
  });

  it('redirects with window.location.replace to location.state.to when provided', async () => {
    mockAxiosPost('success');
    const { container } = render(wrapper(mocks, { pathname: '/login', state: { to: '/flow/2' } }));

    await userAction(container);

    await waitFor(() => {
      expect(locationReplaceMock).toHaveBeenCalledWith('/flow/2');
    });
  });

  it('test the login form submission with incorrect creds', async () => {
    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
    mockAxiosPost('reject', 'Cannot login');
    const { container } = render(wrapper(mocks));

    await userAction(container);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please contact the Glific team.')).toBeInTheDocument();
      expect(localStorageSpy).not.toHaveBeenCalled();
    });
  });

  it('test the login form submission with error', async () => {
    mockAxiosPost('success');
    const { container } = render(
      <MockedProvider mocks={[getCurrentUserErrorQuery, getOrganizationServicesQuery]}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </MockedProvider>
    );

    await userAction(container);

    await waitFor(() => {
      expect(
        screen.getByText('Your account is not approved yet. Please contact your organization admin.')
      ).toBeInTheDocument();
    });
  });

  it('test the login form submission with error(invalid role)', async () => {
    mockAxiosPost('success');
    const { container } = render(
      <MockedProvider mocks={[getCurrentUserInvalidRoleQuery, getOrganizationServicesQuery]}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </MockedProvider>
    );

    await userAction(container);

    await waitFor(() => {
      expect(
        screen.getByText('Your account is not approved yet. Please contact your organization admin.')
      ).toBeInTheDocument();
    });
  });

  it('shows API error message when login fails with error response', async () => {
    const apiError = {
      response: {
        status: 401,
        data: { error: { message: 'Invalid phone or password' } },
      },
    };
    mockAxiosPost('reject', apiError);
    const { container } = render(wrapper(mocks));

    await userAction(container);

    await waitFor(() => {
      expect(screen.getByText('Invalid phone or password')).toBeInTheDocument();
      expect(mockPosthogCapture).toHaveBeenCalledWith('user_login_failed', {
        error: 'Invalid phone or password',
        status: 401,
      });
      expect(mockedSetLogs).toHaveBeenCalledWith(apiError, 'error', true);
    });
  });

  it('shows generic error when login fails without API error details', async () => {
    const networkError = { response: { status: 500 } };
    mockAxiosPost('reject', networkError);
    const { container } = render(wrapper(mocks));

    await userAction(container);

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please contact the Glific team.')).toBeInTheDocument();
      expect(mockPosthogCapture).toHaveBeenCalledWith('user_login_failed', {
        error: 'Unknown error',
        status: 500,
      });
      expect(mockedSetLogs).toHaveBeenCalledWith(networkError, 'error', true);
    });
  });

  it('calls setErrorMessage on 403 login failure', async () => {
    const forbiddenError = {
      response: {
        status: 403,
        data: { error: { message: 'Account suspended' } },
      },
    };
    const errorMessageSpy = vi.spyOn(Notification, 'setErrorMessage');
    mockAxiosPost('reject', forbiddenError);
    const { container } = render(wrapper(mocks));

    await userAction(container);

    await waitFor(() => {
      expect(errorMessageSpy).toHaveBeenCalledWith(forbiddenError.response.data.error);
      expect(mockPosthogCapture).toHaveBeenCalledWith('user_login_failed', {
        error: 'Account suspended',
        status: 403,
      });
      expect(mockedSetLogs).toHaveBeenCalledWith(forbiddenError, 'error', true);
    });
  });
});
