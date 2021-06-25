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

    // click on continue
    const continueButton = screen.getByText('Continue');
    userEvent.click(continueButton);

    // let's mock successful registration submission
    // as we cannot register without opt in we will always get error response
    const errorMessage = 'Cannot register 919978776554';
    axios.post.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));

    await waitFor(() => {
      const authContainer = screen.getByTestId('AuthContainer');
      expect(authContainer).toHaveTextContent(
        'We are unable to register, kindly contact your technical team.'
      );
    });
  });
});
