import React from 'react';
import { render, screen, wait } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { MockedProvider } from '@apollo/client/testing';

import { Login } from './Login';
import { getCurrentUserQuery } from '../../../mocks/User';

const mocks = [getCurrentUserQuery];

jest.mock('axios');

const wrapper = (
  <MockedProvider mocks={mocks}>
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  </MockedProvider>
);

describe('<Login />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders component properly', async () => {
    const { findByTestId } = render(wrapper);
    const authContainer = await findByTestId('AuthContainer');
    expect(authContainer).toHaveTextContent('Login to your account');
  });

  it('test the login form submission with correct creds', async () => {
    const { container } = render(wrapper);
    const phone = screen.getByRole('textbox');
    UserEvent.type(phone, '+919978776554');

    const password = container.querySelector('input[type="password"]');
    UserEvent.type(password, 'pass123456');

    // click on login
    const loginButton = screen.getByText('LOGIN');
    UserEvent.click(loginButton);

    // let's mock successful registration submission
    const responseData = { data: { data: { data: {} } } };
    axios.post.mockImplementationOnce(() => Promise.resolve(responseData));
    await wait();
  });

  it('test the login form submission with incorrect creds', async () => {
    const { container } = render(wrapper);
    const phone = screen.getByRole('textbox');
    UserEvent.type(phone, '+919978776554');

    const password = container.querySelector('input[type="password"]');
    UserEvent.type(password, 'pass123456');

    // click on login
    const loginButton = screen.getByText('LOGIN');
    UserEvent.click(loginButton);

    // set the mock error case while login
    const errorMessage = 'Cannot login';
    axios.post.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
    await wait();
  });
});
