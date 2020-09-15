import React from 'react';
import { render, screen } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

import { Login } from './Login';

jest.mock('axios');

const wrapper = (
  <MemoryRouter>
    <Login />
  </MemoryRouter>
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
    render(wrapper);
  });

  it('test the login form submission with incorrect creds', async () => {
    render(wrapper);
  });
});
