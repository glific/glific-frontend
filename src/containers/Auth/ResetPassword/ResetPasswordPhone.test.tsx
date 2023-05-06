import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import axios from 'axios';
import { vi } from 'vitest';
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
    <ResetPasswordPhone />
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
    const errorMessage = 'Cannot send the otp to 919978776554';
    mockedAxios.post.mockImplementation(() => Promise.reject(new Error(errorMessage)));
    const { container } = render(wrapper);

    // enter the phone
    const phone = container.querySelector('input[type="tel"]') as HTMLInputElement;
    fireEvent.change(phone, { target: { value: '+919978776554' } });

    // click on GENERATE button
    const continueButton = screen.getByText('Generate OTP to confirm');
    UserEvent.click(continueButton);

    await waitFor(() => {
      const authContainer = screen.getByTestId('AuthContainer');
      expect(authContainer).toHaveTextContent(
        'We are unable to generate an OTP, kindly contact your technical team.'
      );
    });
  });

  test('test the form submission with phone', async () => {
    postRequestMock();
    const { container } = render(wrapper);

    // enter the phone
    const phone = container.querySelector('input[type="tel"]') as HTMLInputElement;
    fireEvent.change(phone, { target: { value: '+919978776554' } });

    // click on continue
    await waitFor(() => {
      const continueButton = screen.getByText('Generate OTP to confirm');
      // UserEvent.click(continueButton);
    });

    // let's mock successful login submission
    const responseData = { data: { data: { data: {} } } };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));

    // TODOS: need to fix for successful response
    // await waitFor(() => {
    //   const resetPassword = screen.getByTestId('AuthContainer');
    //   expect(resetPassword).toHaveTextContent('Reset your password');
    //   expect(resetPassword).toHaveTextContent('New Password');
    // });
  });
});
