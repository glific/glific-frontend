import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import axios from 'axios';
import { vi } from 'vitest';
import * as Recaptcha from 'react-google-recaptcha-v3';
import { ResetPasswordPhone } from './ResetPasswordPhone';

vi.mock('axios');
const mockedAxios = axios as any;

export const postRequestMock = () => {
  const responseData = { data: { data: {} } };
  const successPromise = vi.fn(() => Promise.resolve(responseData));
  mockedAxios.post.mockImplementationOnce(() => successPromise());
};

const wrapper = (
  <MemoryRouter>
    <Routes>
      <Route path="/" element={<ResetPasswordPhone />} />
      <Route path="/resetpassword-confirmotp" element={<div>Confirm OTP</div>} />
    </Routes>
  </MemoryRouter>
);

describe('<ResetPasswordPhone />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('it should render correctly', async () => {
    postRequestMock();
    const { findByTestId } = render(wrapper);

    const resetPassword = await findByTestId('AuthContainer');
    expect(resetPassword).toHaveTextContent('Reset your password');
    expect(resetPassword).toHaveTextContent('Generate OTP to confirm');
  });

  test('test the form submission with incorrect phone', async () => {
    // set the mock
    const errorMessage = {
      response: {
        data: {
          error: {
            message: 'Account with phone number 919425010449 does not exist',
          },
        },
      },
    };
    mockedAxios.post.mockImplementation(() => Promise.reject(errorMessage));
    const { container } = render(wrapper);
    const phone = container.querySelector('input[type="tel"]') as HTMLInputElement;
    fireEvent.change(phone, { target: { value: '+919978776554' } });

    // click on GENERATE button
    const continueButton = screen.getByText('Generate OTP to confirm');
    UserEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId('AuthContainer')).toHaveTextContent(
        errorMessage.response.data.error.message
      );
    });
  });

  test('test the form submission with phone', async () => {
    const useRecaptcha = vi.spyOn(Recaptcha, 'useGoogleReCaptcha');
    const promise = () => Promise.resolve('some_fake_token');
    useRecaptcha.mockImplementation(() => ({
      executeRecaptcha: promise,
    }));
    postRequestMock();

    // let's mock successful login submission
    const responseData = { data: { data: { data: {} } } };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));
    const { container } = render(wrapper);

    // enter the phone
    const phone = container.querySelector('input[type="tel"]') as HTMLInputElement;
    fireEvent.change(phone, { target: { value: '+919978776554' } });

    // click on continue
    await waitFor(() => {
      expect(screen.getByText('Generate OTP to confirm')).toBeInTheDocument();
    });
    const continueButton = screen.getByText('Generate OTP to confirm');
    await UserEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm OTP')).toBeInTheDocument();
    });
  });
});
