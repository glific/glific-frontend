import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import axios from 'axios';

import { ResetPasswordPhone } from './ResetPasswordPhone';

jest.mock('axios');

const wrapper = (
  <MemoryRouter>
    <ResetPasswordPhone />
  </MemoryRouter>
);

describe('<ResetPasswordPhone />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('it should render correctly', async () => {
    const { findByTestId } = render(wrapper);

    const resetPassword = await findByTestId('AuthContainer');
    expect(resetPassword).toHaveTextContent('Reset your password');
    expect(resetPassword).toHaveTextContent('Generate OTP to confirm');
  });

  test('test the form submission with incorrect phone', async () => {
    const { container } = render(wrapper);

    // enter the phone
    const phone = container.querySelector('input[type="tel"]');
    fireEvent.change(phone, { target: { value: '+919978776554' } });

    // click on GENERATE button
    const continueButton = screen.getByText('Generate OTP to confirm');
    UserEvent.click(continueButton);

    // set the mock
    const errorMessage = 'Cannot send the otp to 919978776554';
    axios.post.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));

    await waitFor(() => {
      const authContainer = screen.getByTestId('AuthContainer');
      expect(authContainer).toHaveTextContent(
        'We are unable to generate an OTP, kindly contact your technical team.'
      );
    });
  });

  test('test the form submission with phone', async () => {
    const { container } = render(wrapper);

    // enter the phone
    const phone = container.querySelector('input[type="tel"]');
    fireEvent.change(phone, { target: { value: '+919978776554' } });

    // click on continue
    await waitFor(() => {
      const continueButton = screen.getByText('Generate OTP to confirm');
      // UserEvent.click(continueButton);
    });

    // let's mock successful login submission
    const responseData = { data: { data: { data: {} } } };
    axios.post.mockImplementationOnce(() => Promise.resolve(responseData));

    // TODOS: need to fix for successful response
    // await waitFor(() => {
    //   const resetPassword = screen.getByTestId('AuthContainer');
    //   expect(resetPassword).toHaveTextContent('Reset your password');
    //   expect(resetPassword).toHaveTextContent('New Password');
    // });
  });
});
