import React from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { waitFor, render, getByTestId } from '@testing-library/react';

import { Login } from './containers/Auth/Login/Login';
import App from './App';
import { Chat } from './containers/Chat/Chat';
import { CONVERSATION_MOCKS } from './mocks/Chat';
import { setUserSession } from './services/AuthService';

const mocks = CONVERSATION_MOCKS;

const app = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  </MockedProvider>
);

describe('<App /> ', () => {
  test('it should render <App /> component correctly', () => {
    const { container } = render(app);
    expect(container).toBeInTheDocument();
  });

  test('it should render <Login /> component by default', async () => {
    const { getByTestId } = render(app);
    await waitFor(() => {
      expect(getByTestId('AuthContainer')).toBeInTheDocument();
    });
  });

  // test('it should render <Chat /> component if session is active', async () => {
  //   // let's create token expiry date for tomorrow
  //   const tokenExpiryDate = new Date();
  //   tokenExpiryDate.setDate(new Date().getDate() + 1);
  //   localStorage.setItem(
  //     'glific_session',
  //     '{"access_token":"access","renewal_token":"renew", "token_expiry_time":"' +
  //       tokenExpiryDate +
  //       '"}'
  //   );
  //   setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Staff'] }));

  //   const { getByTestId } = render(app);

  //   await waitFor(() => {
  //     expect(getByTestId('chatContainer')).toBeInTheDocument();
  //   });
  // });

  // test('it should not render <Chat /> component if session is active and User Role "None"', async () => {
  //   // let's create token expiry date for tomorrow
  //   const tokenExpiryDate = new Date();
  //   tokenExpiryDate.setDate(new Date().getDate() + 1);
  //   localStorage.setItem(
  //     'glific_session',
  //     '{"access_token":"access","renewal_token":"renew", "token_expiry_time":"' +
  //       tokenExpiryDate +
  //       '"}'
  //   );
  //   setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['None'] }));

  //   const { getByTestId } = render(app);

  //   await waitFor(() => {
  //     expect(getByTestId('chatContainer')).toBeInTheDocument();
  //   });
  // });
});
