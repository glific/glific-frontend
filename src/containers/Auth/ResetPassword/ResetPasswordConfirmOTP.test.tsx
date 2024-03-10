import { render, screen, waitFor } from '@testing-library/react';
import UserEvent, { userEvent } from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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
      expect(resetPassword).toHaveTextContent('New Password');
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

    //need to have an assertion here
    await waitFor(() => {
      expect(screen.getByText('Login page')).toBeInTheDocument();
    });
  });

  it('test successful resend functionality', async () => {
    const sendOptMock = vi.fn();
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
    UserEvent.click(resendButton);
    await waitFor(() => {
      expect(sendOptMock).toHaveBeenCalledWith('919967665667');
    });
  });
});
