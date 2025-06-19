import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from 'App';
import axios from 'axios';
import { CONVERSATION_MOCKS } from 'mocks/Chat';
import { MemoryRouter } from 'react-router';
import * as AuthService from 'services/AuthService';

const mocks = CONVERSATION_MOCKS;
vi.mock('axios');
const mockedUsedNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => mockedUsedNavigate,
}));

const setAuthSessionMock = vi.spyOn(AuthService, 'setAuthSession');

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
