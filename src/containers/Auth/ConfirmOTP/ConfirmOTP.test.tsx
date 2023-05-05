import { render, screen, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import axios from 'axios';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

import { postRequestMock } from '../Registration/Registration.test';
import { ConfirmOTP } from './ConfirmOTP';

vi.mock('axios');
const mockedAxios = axios as any;

const mockedState = {
  state: {
    name: 'Glific user',
    phone: '+919876543210',
    password: 'secret',
    captcha: 'random captcha',
  },
};

vi.mock('react-router-dom', async () => ({
  ...((await vi.importActual<any>('react-router-dom')) as {}),
  useLocation: () => mockedState,
}));

const wrapper = (
  <MemoryRouter>
    <GoogleReCaptchaProvider reCaptchaKey="test key">
      <ConfirmOTP />
    </GoogleReCaptchaProvider>
  </MemoryRouter>
);

describe('<ConfirmOTP />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    postRequestMock();
  });

  it('renders component properly', async () => {
    const { findByTestId } = render(wrapper);

    const authContainer = await findByTestId('AuthContainer');
    expect(authContainer).toHaveTextContent(
      'Please confirm the OTP received at your WhatsApp number.'
    );
  });

  it('test the OTP form submission with correct OTP', async () => {
    // let's mock successful otp submission
    const responseData = { data: { data: { data: {} } } };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));

    render(wrapper);

    await waitFor(() => {
      // enter the otp
      const input = screen.getByRole('textbox');
      UserEvent.type(input, '12345');

      // click on continue
      const continueButton = screen.getByText('Continue');
      UserEvent.click(continueButton);
    });

    await waitFor(() => {});
  });

  it('test the OTP form submission with incorrect OTP', async () => {
    // let's mock error response on otp submission
    const errorMessage = 'We are unable to register, kindly contact your technical team.';
    mockedAxios.post.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
    render(wrapper);

    await waitFor(() => {
      // enter the otp
      const input = screen.getByRole('textbox');
      UserEvent.type(input, '12345');

      // click on continue
      const continueButton = screen.getByText('Continue');
      UserEvent.click(continueButton);
    });

    await waitFor(() => {});
  });

  it('test successful resend functionality', async () => {
    // set the mock
    const responseData = {
      data: { message: 'OTP sent successfully to 919967665667', phone: '919967665667' },
    };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));
    render(wrapper);

    await waitFor(() => {
      const resendButton = screen.getByTestId('resendOtp');
      UserEvent.click(resendButton);
    });
    // click on resend button

    await waitFor(() => {});
  });

  it('test unsuccessful resend functionality', async () => {
    render(wrapper);

    // set the mock
    const errorMessage = 'Cannot send the otp to 919967665667';
    mockedAxios.post.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));

    await waitFor(() => {
      // click on resend button
      const resendButton = screen.getByTestId('resendOtp');
      UserEvent.click(resendButton);
    });

    await waitFor(() => {});
  });
});
