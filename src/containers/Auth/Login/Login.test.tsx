import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { MockedProvider } from '@apollo/client/testing';

import {
  getCurrentUserQuery,
  getCurrentUserErrorQuery,
  getCurrentUserInvalidRoleQuery,
} from 'mocks/User';
import { Login } from './Login';

const mocks = [getCurrentUserQuery];

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const wrapper = (
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
    jest.resetAllMocks();
  });

  it('renders component properly', async () => {
    const { findByTestId } = render(wrapper);
    const authContainer = await findByTestId('AuthContainer');
    expect(authContainer).toHaveTextContent('Login to your account');
  });

  it('test the login form submission with correct creds', async () => {
    const { container } = render(wrapper);

    userAction(container);

    // let's mock successful registration submission
    const responseData = { data: { data: { data: {} } } };

    const successPromise = jest.fn(() => Promise.resolve(responseData));

    act(() => {
      mockedAxios.post.mockImplementationOnce(() => successPromise());
    });

    await waitFor(() => {
      expect(successPromise).toHaveBeenCalled();
    });
  });

  it('test the login form submission with incorrect creds', async () => {
    const { container } = render(wrapper);

    userAction(container);

    // set the mock error case while login
    const errorMessage = 'Cannot login';
    const rejectPromise = jest.fn(() => Promise.reject(errorMessage));

    act(() => {
      mockedAxios.post.mockImplementationOnce(() => rejectPromise());
    });

    await waitFor(() => {
      expect(rejectPromise).toHaveBeenCalled();
    });
  });

  it('test the login form submission with error', async () => {
    const { container } = render(
      <MockedProvider mocks={[getCurrentUserErrorQuery]}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </MockedProvider>
    );

    userAction(container);

    // let's mock successful registration submission
    const responseData = { data: { data: { data: {} } } };

    const successPromise = jest.fn(() => Promise.resolve(responseData));

    act(() => {
      mockedAxios.post.mockImplementationOnce(() => successPromise());
    });

    await waitFor(() => {
      expect(successPromise).toHaveBeenCalled();
    });
  });

  it('test the login form submission with error(invalid role)', async () => {
    const { container } = render(
      <MockedProvider mocks={[getCurrentUserInvalidRoleQuery]}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </MockedProvider>
    );

    userAction(container);

    // let's mock successful registration submission
    const responseData = { data: { data: { data: {} } } };

    const successPromise = jest.fn(() => Promise.resolve(responseData));

    act(() => {
      mockedAxios.post.mockImplementationOnce(() => successPromise());
    });

    await waitFor(() => {
      expect(successPromise).toHaveBeenCalled();
    });
  });
});
