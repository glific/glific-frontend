import { render, screen, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import axios from 'axios';
import { vi } from 'vitest';

import { postRequestMock } from '../Registration/Registration.test';
import { ResetPasswordConfirmOTP } from './ResetPasswordConfirmOTP';

vi.mock('axios');
const mockedAxios = axios as any;

const wrapper = (
  <MemoryRouter>
    <ResetPasswordConfirmOTP />
  </MemoryRouter>
);

describe('<ResetPasswordConfirmOTP />', () => {
  beforeEach(() => {
    postRequestMock();
  });
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
    UserEvent.type(inputElements[1], '76554');

    const password = container.querySelector('input[type="password"]') as HTMLInputElement;
    UserEvent.type(password, 'pass123456');

    // click on save button
    await waitFor(() => {
      const saveButton = screen.getByText('Save');
      UserEvent.click(saveButton);
    });

    //need to have an assertion here
    await waitFor(() => {});
  });

  it('test successful resend functionality', async () => {
    // set the mock
    const responseData = {
      data: { message: 'OTP sent successfully to 919967665667', phone: '919967665667' },
    };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));
    render(wrapper);

    // click on resend button
    await waitFor(() => {
      const resendButton = screen.getByTestId('resendOtp');
      UserEvent.click(resendButton);
    });
    await waitFor(() => {});
  });
});
