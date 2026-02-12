import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import axios from 'axios';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { vi } from 'vitest';
import * as Recaptcha from 'react-google-recaptcha-v3';
import { Registration } from './Registration';

vi.mock('axios');
const mockedAxios = axios as any;

const wrapper = (
  <MemoryRouter>
    <GoogleReCaptchaProvider reCaptchaKey="test key">
      <Routes>
        <Route path="/" element={<Registration />} />
        <Route path="/confirmotp" element={<div>Confirm OTP</div>} />
      </Routes>
    </GoogleReCaptchaProvider>
  </MemoryRouter>
);

export const postRequestMock = () => {
  const responseData = { data: { data: {} } };
  const successPromise = vi.fn(() => Promise.resolve(responseData));
  mockedAxios.post.mockImplementation(() => successPromise());
};

describe('<Registration />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    postRequestMock();
  });

  it('should render correctly', async () => {
    render(wrapper);

    await waitFor(() => {
      const registration = screen.getByTestId('AuthContainer');
      expect(registration).toHaveTextContent('Create your new account');
    });
  });

  it('should check if all the fields are in correct state', async () => {
    const user = userEvent.setup();
    const { container } = render(wrapper);

    const userName = container.querySelector('input[name="userName"]') as HTMLInputElement;

    await user.click(userName);
    await user.keyboard('John doe');

    const phone = container.querySelector('input[type="tel"]') as HTMLInputElement;
    await user.click(phone);
    await user.keyboard('+919978776554');

    const password = container.querySelector('input[type="password"]') as HTMLInputElement;
    await user.click(password);
    await user.keyboard('pass123456');

    const email = container.querySelector('input[type="email"]') as HTMLInputElement;
    await user.click(email);
    await user.keyboard('you@domain.com');
    const checkbox = container.querySelector('input[name="consent_for_updates"]') as HTMLInputElement;
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('should submit the form correctly', async () => {
    const useRecaptcha = vi.spyOn(Recaptcha, 'useGoogleReCaptcha');
    const promise = () => Promise.resolve('some_fake_token');
    useRecaptcha.mockImplementation(() => ({
      executeRecaptcha: promise,
    }));

    // let's mock successful registration submission
    const responseData = {
      values: {
        username: 'Jane Doe',
        phone: '+919978776554',
        password: 'Pass@123456',
        email: 'you@domain.com',
        consent_for_updates: true,
      },
    };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));

    const { container, getByText } = render(wrapper);

    const userName = container.querySelector('input[name="name"]') as HTMLInputElement;
    fireEvent.change(userName, { target: { value: 'John Doe' } });

    const phone = container.querySelector('input[type="tel"]') as HTMLInputElement;
    fireEvent.change(phone, { target: { value: '+919978776554' } });

    const password = container.querySelector('input[type="password"]') as HTMLInputElement;
    fireEvent.change(password, { target: { value: 'Pass@123456' } });

    const email = container.querySelector('input[type="email"]') as HTMLInputElement;
    fireEvent.change(email, { target: { value: 'you@domain.com' } });

    const checkbox = container.querySelector('input[name="consent_for_updates"]') as HTMLInputElement;
    expect(checkbox).toBeChecked();

    const registerWithButton = screen.getByTestId('SubmitButton') as HTMLButtonElement;

    fireEvent.click(registerWithButton);

    // Wait for async state updates and navigation
    await waitFor(
      () => {
        expect(getByText('Confirm OTP')).toBeInTheDocument();
      },
      {
        timeout: 3000,
        interval: 50, // Check every 50ms instead of default 50ms
      }
    );
  });

  it('should not submit the form when password validation fails', async () => {
    const useRecaptcha = vi.spyOn(Recaptcha, 'useGoogleReCaptcha');
    const promise = () => Promise.resolve('some_fake_token');
    useRecaptcha.mockImplementation(() => ({
      executeRecaptcha: promise,
    }));

    const { container, queryByText } = render(wrapper);

    const userName = container.querySelector('input[name="name"]') as HTMLInputElement;
    fireEvent.change(userName, { target: { value: 'John Doe' } });

    const phone = container.querySelector('input[type="tel"]') as HTMLInputElement;
    fireEvent.change(phone, { target: { value: '+919978776554' } });

    const password = container.querySelector('input[type="password"]') as HTMLInputElement;
    fireEvent.change(password, { target: { value: 'abc' } }); // Invalid password

    const email = container.querySelector('input[type="email"]') as HTMLInputElement;
    fireEvent.change(email, { target: { value: 'you@domain.com' } });

    const registerWithButton = screen.getByTestId('SubmitButton') as HTMLButtonElement;
    fireEvent.click(registerWithButton);

    // Wait to ensure validation blocks submission
    await waitFor(
      () => {
        expect(queryByText('Confirm OTP')).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
