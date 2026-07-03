import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import axios from 'axios';
import { vi } from 'vitest';

import { postRequestMock } from '../Registration/Registration.test';
import { ResetPasswordConfirmOTP } from './ResetPasswordConfirmOTP';
import * as AuthService from 'services/AuthService';

vi.mock('axios');
const mockedAxios = axios as any;

const wrapper = (
  <MemoryRouter initialEntries={[{ state: { phoneNumber: '919967665667' } }]}>
    <Routes>
      <Route path="/" element={<ResetPasswordConfirmOTP />} />
      <Route path="/login" element={<div>Login page</div>} />
    </Routes>
  </MemoryRouter>
);

describe('<ResetPasswordConfirmOTP />', () => {
  beforeEach(() => {
    postRequestMock();
  });

  const user = userEvent.setup();

  test('it should render', async () => {
    const { findByTestId } = render(wrapper);
    const resetPassword = await findByTestId('AuthContainer');
    await waitFor(() => {
      expect(resetPassword).toHaveTextContent('Reset your password');
      // The new-password field is identified by its placeholder (no redundant heading label,
      // consistent with the OTP field).
      expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
    });
  });

  test('it should display the neutral, non-disclosing OTP note', async () => {
    const { findByTestId } = render(wrapper);
    const resetPassword = await findByTestId('AuthContainer');
    await waitFor(() => {
      expect(resetPassword).toHaveTextContent(
        "If this number is registered, you'll receive an OTP on WhatsApp. Enter it below to reset your password."
      );
    });
  });

  test('it should submit the form correctly', async () => {
    // let's mock successful reset password
    const responseData = { data: { data: { data: {} } } };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));
    const { container } = render(wrapper);

    const inputElements = screen.getAllByRole('textbox');
    await user.type(inputElements[1], '7655');

    const password = container.querySelector('input[type="password"]') as HTMLInputElement;
    await user.type(password, 'Secret1234!');

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Login page')).toBeInTheDocument();
    });
  });

  it('test successful resend functionality', async () => {
    const sendOptMock = vi.fn(() => Promise.resolve({ data: { data: {} } } as any));
    vi.spyOn(AuthService, 'sendOTP').mockImplementation(sendOptMock);
    // set the mock
    const responseData = {
      data: { message: 'OTP sent successfully to 919967665667', phone: '919967665667' },
    };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));
    render(wrapper);

    await waitFor(() => {
      expect(screen.getByTestId('resendOtp')).toBeInTheDocument();
    });
    // click on resend button
    const resendButton = screen.getByTestId('resendOtp');
    user.click(resendButton);
    await waitFor(() => {
      // Resends against the prepopulated phone number carried from the previous screen.
      expect(sendOptMock).toHaveBeenCalledWith('919967665667');
    });
    // Brief confirmation so the user knows the OTP was sent.
    await waitFor(() => {
      expect(screen.getByTestId('AuthContainer')).toHaveTextContent('OTP sent successfully.');
    });
  });

  it('shows a retry hint when resend fails', async () => {
    const sendOptMock = vi.fn(() => Promise.reject(new Error('too soon')));
    vi.spyOn(AuthService, 'sendOTP').mockImplementation(sendOptMock);
    render(wrapper);

    const resendButton = await screen.findByTestId('resendOtp');
    await user.click(resendButton);

    await waitFor(() => {
      expect(screen.getByTestId('AuthContainer')).toHaveTextContent(
        'Could not resend the OTP. Please try again in 30 seconds.'
      );
    });
  });

  it('falls back gracefully when no phone number is provided in state', async () => {
    const sendOptMock = vi.fn(() => Promise.resolve({ data: { data: {} } } as any));
    vi.spyOn(AuthService, 'sendOTP').mockImplementation(sendOptMock);
    const wrapperWithoutPhone = (
      <MemoryRouter initialEntries={[{ state: { from: '/resetpassword-phone' } }]}>
        <Routes>
          <Route path="/" element={<ResetPasswordConfirmOTP />} />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    );
    render(wrapperWithoutPhone);

    const resendButton = await screen.findByTestId('resendOtp');
    await user.click(resendButton);

    await waitFor(() => {
      // No phone in state and none in the (empty) form field, so resend falls back to ''.
      expect(sendOptMock).toHaveBeenCalledWith('');
    });
  });
});
