import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from 'App';
import axios from 'axios';
import { CONVERSATION_MOCKS } from 'mocks/Chat';
import { getCurrentUserQuery } from 'mocks/User';
import { MemoryRouter } from 'react-router';
import { setAuthSession, setUserSession } from 'services/AuthService';
import * as AuthService from 'services/AuthService';
import * as TokenManager from 'services/TokenManager';

const mocks = [...CONVERSATION_MOCKS, getCurrentUserQuery];
vi.mock('axios');
// The logout route renders <Logout/>, which calls apiClient.delete. A bare axios mock makes
// axios.create() undefined, so mock the apiClient module the same way its own tests do.
vi.mock('services/apiClient', () => ({
  apiClient: { delete: vi.fn(), get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));
const mockedUsedNavigate = vi.fn();
const setAuthSessionMock = vi.spyOn(AuthService, 'setAuthSession');

vi.mock('routes/AuthenticatedRoute/AuthenticatedRoute', () => ({
  default: () => <div>Authenticated route subscription</div>,
  AuthenticatedRoute: () => <div>Chat subscription</div>,
}));

vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => mockedUsedNavigate,
}));

const app = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter initialEntries={['/login']}>
      <App />
    </MemoryRouter>
  </MockedProvider>
);
const mockedAxios = axios as any;

beforeEach(() => {
  localStorage.clear();

  mockedAxios.post.mockResolvedValueOnce({
    data: {
      name: 'Glific',
      status: 'active',
    },
  });
});

describe('App Component', () => {
  test('renders the login page', async () => {
    const container = render(app);
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Login to your account')).toBeInTheDocument();
      expect(screen.getByText('Glific')).toBeInTheDocument();
    });
  });

  test('it logs in the user', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        data: {
          access_token: 'access',
          renewal_token: 'renew',
          token_expiry_time: new Date(new Date().getTime() + 3600 * 1000).toISOString(),
          last_login_time: null,
        },
      },
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        data: {
          access_token: 'access2',
          renewal_token: 'renew2',
          token_expiry_time: new Date(new Date().getTime() + 3600 * 1000).toISOString(),
        },
      },
    });

    render(app);

    await waitFor(() => {
      expect(screen.getByText('Login to your account')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Your phone number'), { target: { value: '+919978776554' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: '+passow' } });

    fireEvent.click(screen.getByTestId('SubmitButton'));

    await waitFor(() => {
      expect(setAuthSessionMock).toHaveBeenCalled();
    });
  });
});

describe('App Component - Token Refresh Tests', () => {
  test('proactively renews the access token via TokenManager when a session is present', async () => {
    const getValidAccessTokenSpy = vi
      .spyOn(TokenManager, 'getValidAccessToken')
      .mockResolvedValue('fresh_access_token');

    const tokenExpiryDate = new Date();
    tokenExpiryDate.setDate(new Date().getDate() - 1);

    setAuthSession({
      access_token: 'expired_token',
      renewal_token: 'renewal_token',
      token_expiry_time: tokenExpiryDate,
    });

    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Staff'] }));

    render(app);

    // Apollo's authLink asks TokenManager for a valid token before sending the operation.
    await waitFor(() => {
      expect(getValidAccessTokenSpy).toHaveBeenCalled();
    });

    getValidAccessTokenSpy.mockRestore();
  });

  test('navigates to /logout/session when TokenManager emits a forced logout', async () => {
    let emitForcedLogout: ((reason: string) => void) | undefined;
    const onForcedLogoutSpy = vi.spyOn(TokenManager, 'onForcedLogout').mockImplementation((cb) => {
      emitForcedLogout = cb;
      return () => {};
    });

    render(app);

    // App wires exactly one forced-logout subscriber that turns the event into navigation.
    await waitFor(() => {
      expect(onForcedLogoutSpy).toHaveBeenCalled();
    });

    emitForcedLogout?.('refresh_unauthorized');

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/logout/session');
    });

    onForcedLogoutSpy.mockRestore();
  });

  test('should handle logout route correctly', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={['/logout/user']}>
          <App />
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Your session has expired!')).toBeInTheDocument();
    });
  });
});
