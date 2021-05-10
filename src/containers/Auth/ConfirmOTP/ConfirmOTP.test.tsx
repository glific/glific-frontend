import { act, render, screen, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import axios from 'axios';
import { ConfirmOTP } from './ConfirmOTP';

jest.mock('axios');

const defaultProps = { location: { state: { name: '', phoneNumber: '', password: '' } } };

const wrapper = (
  <MemoryRouter>
    <ConfirmOTP {...defaultProps} />
  </MemoryRouter>
);

describe('<ConfirmOTP />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders component properly', async () => {
    const { findByTestId } = render(wrapper);

    const authContainer = await findByTestId('AuthContainer');
    expect(authContainer).toHaveTextContent(
      'Please confirm the OTP received at your WhatsApp number.'
    );
  });

  it('test the OTP form submission with correct OTP', async () => {
    render(wrapper);

    await waitFor(() => {
      // enter the otp
      const input = screen.getByRole('textbox');
      UserEvent.type(input, '12345');

      const continueButton = screen.getByText('Continue');
      UserEvent.click(continueButton);
    });

    // let's mock successful otp submission
    const responseData = { data: { data: { data: {} } } };
    act(() => {
      axios.post.mockImplementationOnce(() => Promise.resolve(responseData));
    });
  });

  it('test the OTP form submission with incorrect OTP', async () => {
    render(wrapper);

    await waitFor(() => {
      // enter the otp
      const input = screen.getByRole('textbox');
      UserEvent.type(input, '12345');

      // click on continue
      const continueButton = screen.getByText('Continue');
      UserEvent.click(continueButton);
    });

    // let's mock error response on otp submission
    const errorMessage = 'We are unable to register, kindly contact your technical team.';

    act(() => {
      axios.post.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
    });
  });

  it('test successful resend functionality', async () => {
    render(wrapper);

    // set the mock
    const responseData = {
      data: { message: 'OTP sent successfully to 919967665667', phone: '919967665667' },
    };

    act(() => {
      axios.post.mockImplementationOnce(() => Promise.resolve(responseData));
    });

    // click on resend button
    const resendButton = screen.getByTestId('resendOtp');
    UserEvent.click(resendButton);
  });

  it('test unsuccessful resend functionality', async () => {
    render(wrapper);

    // set the mock
    const errorMessage = 'Cannot send the otp to 919967665667';

    act(() => {
      axios.post.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
    });

    await waitFor(() => {
      // click on resend button
      const resendButton = screen.getByTestId('resendOtp');
      UserEvent.click(resendButton);
    });
  });
});
