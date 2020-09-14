import React from 'react';
import { render, screen } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';

import axios from 'axios';

import { ConfirmOTP } from './ConfirmOTP';
import { MemoryRouter } from 'react-router-dom';

jest.mock('axios');

const defaultProps = { location: { state: { name: '', phoneNumber: '', password: '' } } };

const wrapper = (
  <MemoryRouter>
    <ConfirmOTP {...defaultProps} />
  </MemoryRouter>
);

describe('<ConfirmOTP />', () => {
  it('renders component properly', async () => {
    const { findByTestId } = render(wrapper);
    const authContainer = await findByTestId('AuthContainer');
    expect(authContainer).toHaveTextContent(
      'Please confirm the OTP received at your whatsapp number.'
    );
  });

  it('test the OTP form submission with correct OTP', async () => {
    render(wrapper);

    // enter the otp
    const input = screen.getByRole('textbox');
    UserEvent.type(input, '12345');

    // click on continue
    const continueButton = screen.getByText('CONTINUE');
    UserEvent.click(continueButton);

    // let's mock successful otp submission
    const responseData = { data: { data: { data: {} } } };
    axios.post.mockImplementationOnce(() => Promise.resolve(responseData));
  });

  it('test the OTP form submission with incorrect OTP', async () => {
    render(wrapper);

    // enter the otp
    const input = screen.getByRole('textbox');
    UserEvent.type(input, '12345');

    // click on continue
    const continueButton = screen.getByText('CONTINUE');
    UserEvent.click(continueButton);

    // let's mock error response on otp submission
    const errorMessage = 'We are unable to register, kindly contact your technical team.';
    axios.post.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
  });

  it('test successful resend functionality', async () => {
    render(wrapper);

    // click on resend button
    const resendButton = screen.getByText('resend');
    UserEvent.click(resendButton);

    // let's mock resend otp submission
    const responseData = {
      data: { message: 'OTP sent successfully to 919967665667', phone: '919967665667' },
    };
    const responseValues = axios.post.mockImplementationOnce(() => Promise.resolve(responseData));
    await expect(responseValues).resolves.toEqual(responseData);
  });
});
