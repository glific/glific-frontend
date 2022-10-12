import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { waitFor, render } from '@testing-library/react';

import App from 'App';
import { CONVERSATION_MOCKS } from 'mocks/Chat';
import { setAuthSession, setUserSession } from 'services/AuthService';

const mocks = CONVERSATION_MOCKS;

jest.mock('axios', () => {
  return {
    defaults: { headers: { common: {} } },
    get: jest.fn(),
    delete: jest.fn(),
  };
});

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ test: 100 }),
  })
) as jest.Mock;

const app = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  </MockedProvider>
);

describe('<App /> ', () => {
  test('it should render <Login /> component by default', async () => {
    const { getByTestId } = render(app);

    await waitFor(() => {
      expect(getByTestId('AuthContainer')).toBeInTheDocument();
    });
  });

  test('it should render <App /> component correctly', async () => {
    const { container } = render(app);
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });

  test('it should render <Chat /> component if session is active', async () => {
    // let's create token expiry date for tomorrow

    const tokenExpiryDate = new Date();
    tokenExpiryDate.setDate(new Date().getDate() + 1);

    setAuthSession(
      '{"access_token":"access","renewal_token":"renew", "token_expiry_time":"' +
        tokenExpiryDate +
        '"}'
    );

    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Staff'] }));

    const { getByTestId } = render(app);

    await waitFor(() => {
      expect(getByTestId('navbar')).toBeInTheDocument();
    });
  });
});
