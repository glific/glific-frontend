import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { waitFor, render, screen } from '@testing-library/react';
import { vi, describe, it } from 'vitest';
import { setAuthSession, setUserSession, renewAuthToken } from 'services/AuthService';
import App from 'App';
import { CONVERSATION_MOCKS } from 'mocks/Chat';
import * as AuthService from 'services/AuthService';

const mocks = CONVERSATION_MOCKS;
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as any;

global.fetch = vi.fn() as any;

const app = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  </MockedProvider>
);

vi.mock('routes/AuthenticatedRoute/AuthenticatedRoute', () => ({
  default: () => <div>Authenticated route subscription</div>,
  AuthenticatedRoute: () => <div>Chat subscription</div>,
}));

describe('<App /> ', () => {
  it('it should render <Login /> component by default', async () => {
    mockedAxios.post.mockImplementation(() => Promise.resolve({}));
    const { getByTestId } = render(app);

    await waitFor(() => {
      expect(getByTestId('AuthContainer')).toBeInTheDocument();
    });
  });

  it('it should render <App /> component correctly in unauthenticated mode', async () => {
    const { container } = render(app);
    await waitFor(() => {
      expect(container).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
    });
  });

  it('it should render <App /> component correctly in authenticated mode', async () => {
    const tokenExpiryDate = new Date();
    tokenExpiryDate.setDate(new Date().getDate() + 1);

    setAuthSession({
      access_token: 'access',
      renewal_token: 'renew',
      token_expiry_time: tokenExpiryDate,
    });

    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Staff'] }));
    render(app);
    await waitFor(() => {
      expect(screen.getByText('Chat subscription')).toBeInTheDocument();
    });
  });

  it('it should renew token and render <App /> component in authenticated mode if token has expired', async () => {
    const spy = vi.spyOn(AuthService, 'renewAuthToken');
    spy.mockImplementation(
      vi.fn(() => {
        const tokenExpiryDate = new Date();
        tokenExpiryDate.setDate(new Date().getDate() + 1);
        return Promise.resolve({
          data: {
            data: {
              access_token: 'access',
              renewal_token: 'renew',
              token_expiry_time: tokenExpiryDate,
            },
          },
        });
      })
    ),
      // let's create token expiry date for yesterday
      mockedAxios.post.mockResolvedValue(() => Promise.resolve({}));

    const tokenExpiryDate = new Date();
    tokenExpiryDate.setDate(new Date().getDate() - 1);

    setAuthSession({
      access_token: 'access',
      renewal_token: 'renew',
      token_expiry_time: tokenExpiryDate,
    });

    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Staff'] }));

    render(app);

    await waitFor(() => {
      expect(renewAuthToken).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Chat subscription')).toBeInTheDocument();
    });
  });

  it('it should render <Login /> component and try to renew token if session has expired', async () => {
    const spy = vi.spyOn(AuthService, 'renewAuthToken');
    spy.mockImplementation(
      vi.fn(() => {
        return Promise.reject(new Error('Mock error'));
      })
    ),
      // let's create token expiry date for yesterday
      mockedAxios.post.mockResolvedValue(() => Promise.resolve({}));

    const tokenExpiryDate = new Date();
    tokenExpiryDate.setDate(new Date().getDate() - 1);

    setAuthSession({
      access_token: 'access',
      renewal_token: 'renew',
      token_expiry_time: tokenExpiryDate,
    });

    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Staff'] }));

    render(app);

    await waitFor(() => {
      expect(renewAuthToken).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('AuthContainer')).toBeInTheDocument();
    });
  });
});
