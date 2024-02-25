import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { waitFor, render } from '@testing-library/react';
import { vi, describe, it } from 'vitest';

import App from 'App';
import { CONVERSATION_MOCKS } from 'mocks/Chat';
import { setAuthSession, setUserSession } from 'services/AuthService';

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

describe('<App /> ', () => {
  it('it should render <Login /> component by default', async () => {
    mockedAxios.post.mockImplementation(() => Promise.resolve({}));
    const { getByTestId } = render(app);

    await waitFor(() => {
      expect(getByTestId('AuthContainer')).toBeInTheDocument();
    });
  });

  it('it should render <App /> component correctly', async () => {
    const { container } = render(app);
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });

  it('it should render <Chat /> component if session is active', async () => {
    // let's create token expiry date for tomorrow
    mockedAxios.post.mockResolvedValue(() => Promise.resolve({}));

    const tokenExpiryDate = new Date();
    tokenExpiryDate.setDate(new Date().getDate() + 1);

    setAuthSession({
      access_token: 'access',
      renewal_token: 'renew',
      token_expiry_time: tokenExpiryDate,
    });

    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Staff'] }));

    const { getByTestId } = render(app);

    await waitFor(() => {
      expect(getByTestId('navbar')).toBeInTheDocument();
    });
  });
});
