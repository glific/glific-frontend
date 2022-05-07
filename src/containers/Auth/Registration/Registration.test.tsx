import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

import { Registration } from './Registration';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const wrapper = (
  <MemoryRouter>
    <Registration />
  </MemoryRouter>
);

describe('<Registration />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render correctly', async () => {
    render(wrapper);

    await waitFor(() => {
      const registration = screen.getByTestId('AuthContainer');
      expect(registration).toHaveTextContent('Create your new account');
    });
  });

  it('should submit the form correctly and give error', async () => {
    const { container } = render(wrapper);

    const userName = await container.querySelector('input[name="userName"]');
    userEvent.type(userName, 'Jane Doe');

    const phone = await container.querySelector('input[type="tel"]');
    userEvent.type(phone, '+919978776554');

    const password = await container.querySelector('input[type="password"]');
    userEvent.type(password, 'pass123456');

    // set the mock error case while registration
    const errorMessage = 'Cannot register 919978776554';
    mockedAxios.post.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));

    await waitFor(() => {
      // click on continue
      const continueButton = screen.getByText('Continue');
      userEvent.click(continueButton);
    });

    await waitFor(() => {
      const authContainer = screen.getByTestId('AuthContainer');
      expect(authContainer).toHaveTextContent(
        'We are unable to register, kindly contact your technical team.'
      );
    });
  });

  it('should submit the form correctly', async () => {
    const { container } = render(wrapper);

    const userName = await container.querySelector('input[name="userName"]');
    userEvent.type(userName, 'Jane Doe');

    const phone = await container.querySelector('input[type="tel"]');
    userEvent.type(phone, '+919978776554');

    const password = await container.querySelector('input[type="password"]');
    userEvent.type(password, 'pass123456');

    // let's mock successful registration submission
    const responseData = {
      values: { username: 'Jane Doe', phone: '+919978776554', password: 'pass123456' },
    };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));

    // click on continue
    await waitFor(() => {
      const continueButton = screen.getByText('Continue');
      // userEvent.click(continueButton);
    });

    // TODOS: we need to test successful response
    // await waitFor(() => {
    //   const authContainer = screen.getByTestId('AuthContainer');
    //   expect(authContainer).toHaveTextContent(
    //     'Please confirm the OTP received at your WhatsApp number.'
    //   );
    // });
  });
});
