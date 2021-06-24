import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

import { Registration } from './Registration';

jest.mock('axios');

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

  it('should submit the form correctly', async () => {
    const { container } = render(wrapper);

    const userName = await container.querySelector('input[name="userName"]');
    userEvent.type(userName, 'Jane Doe');

    const phone = await container.querySelector('input[type="tel"]');
    userEvent.type(phone, '+919978776554');

    const password = await container.querySelector('input[type="password"]');
    userEvent.type(password, 'pass123456');

    await waitFor(() => {
      // click on continue
      const continueButton = screen.getByText('Continue');
      userEvent.click(continueButton);
    });

    // let's mock successful registration submission
    const responseData = { data: { data: { data: {} } } };
    axios.post.mockImplementationOnce(() => Promise.resolve(responseData));

    await waitFor(() => {
      const authContainer = screen.getByTestId('AuthContainer');
      expect(authContainer).toHaveTextContent(
        'We are unable to register, kindly contact your technical team.'
      );
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

    await waitFor(() => {
      // click on continue
      const continueButton = screen.getByText('Continue');
      userEvent.click(continueButton);
    });

    // set the mock error case while registration
    const errorMessage = 'Cannot register 919978776554';
    axios.post.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
  });
});
