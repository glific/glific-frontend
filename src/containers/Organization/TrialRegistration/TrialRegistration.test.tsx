import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import axios from 'axios';
import { TrialRegistration } from './TrialRegistration';

vi.mock('axios');
const mockedAxios = axios as any;

const wrapper = (
  <BrowserRouter>
    <MockedProvider>
      <TrialRegistration />
    </MockedProvider>
  </BrowserRouter>
);

describe('TrialRegistration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render TrialRegistration component', async () => {
    render(wrapper);

    await waitFor(() => {
      expect(screen.getByTestId('TrialRegistrationContainer')).toBeInTheDocument();
      expect(screen.getByText('Start Your Glific Trial')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Organization Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Phone Number')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Create password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
      expect(screen.getByTestId('StartTrialButton')).toBeInTheDocument();
    });
  });

  test('should show validation errors for empty fields', async () => {
    render(wrapper);

    const getOtpButton = screen.getByText('get otp');
    fireEvent.click(getOtpButton);

    await waitFor(() => {
      expect(screen.getByText('Please fill all required fields correctly')).toBeInTheDocument();
    });
  });

  test('should show validation error for invalid organization name', async () => {
    render(wrapper);

    const orgNameInput = screen.getByPlaceholderText('Organization Name');
    fireEvent.change(orgNameInput, { target: { value: '123' } });
    fireEvent.blur(orgNameInput);

    await waitFor(() => {
      expect(screen.getByText('Organization name can only contain alphabets and spaces')).toBeInTheDocument();
    });
  });

  test('should show validation error for invalid username', async () => {
    render(wrapper);

    const usernameInput = screen.getByPlaceholderText('Your name');
    fireEvent.change(usernameInput, { target: { value: 'test123' } });
    fireEvent.blur(usernameInput);

    await waitFor(() => {
      expect(screen.getByText('Name can only contain alphabets and spaces')).toBeInTheDocument();
    });
  });

  test('should send OTP successfully', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          message: 'OTP sent successfully to amisha@gmail.com',
        },
      },
    });

    render(wrapper);

    // Fill in the form - FIX: Add the missing fireEvent.change line
    fireEvent.change(screen.getByPlaceholderText('Organization Name'), {
      target: { value: 'Testing Org' },
    });
    fireEvent.change(screen.getByPlaceholderText('Your name'), {
      target: { value: 'Amisha' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'amisha@gmail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), {
      target: { value: '+917834811114' },
    });
    fireEvent.change(screen.getByPlaceholderText('Create password'), {
      target: { value: 'Secret1234!' },
    });

    const getOtpButton = screen.getByText('get otp');
    fireEvent.click(getOtpButton);

    await waitFor(() => {
      expect(screen.getByText('OTP sent successfully to your email')).toBeInTheDocument();
      expect(screen.getByText('resend otp')).toBeInTheDocument();
    });
  });

  test('should show error when user already exists', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: false,
        error: 'User with this email or phone already exists',
      },
    });

    render(wrapper);

    fireEvent.change(screen.getByPlaceholderText('Organization Name'), {
      target: { value: 'Testing Org' },
    });
    fireEvent.change(screen.getByPlaceholderText('Your name'), {
      target: { value: 'Amisha' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'existing@gmail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), {
      target: { value: '+917834811114' },
    });
    fireEvent.change(screen.getByPlaceholderText('Create password'), {
      target: { value: 'Secret1234!' },
    });

    const getOtpButton = screen.getByText('get otp');
    fireEvent.click(getOtpButton);

    await waitFor(() => {
      expect(screen.getByText('User with this email or phone already exists')).toBeInTheDocument();
    });
  });

  test('should handle OTP resend', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        success: true,
        data: {
          message: 'OTP sent successfully to amisha@gmail.com',
        },
      },
    });

    render(wrapper);

    fireEvent.change(screen.getByPlaceholderText('Organization Name'), {
      target: { value: 'Testing Org' },
    });
    fireEvent.change(screen.getByPlaceholderText('Your name'), {
      target: { value: 'Amisha' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'amisha@gmail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), {
      target: { value: '+917834811114' },
    });
    fireEvent.change(screen.getByPlaceholderText('Create password'), {
      target: { value: 'Secret1234!' },
    });

    fireEvent.click(screen.getByText('get otp'));

    await waitFor(() => {
      expect(screen.getByText('resend otp')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('resend otp'));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      expect(screen.getByText('OTP sent successfully to your email')).toBeInTheDocument();
    });
  });

  test('should submit trial account successfully and redirect', async () => {
    // Mock send OTP
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
      },
    });

    // Mock allocate account
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          login_url: 'https://testorg.glific.com/login',
        },
      },
    });

    // Mock window.location.href - FIX HERE
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });

    render(wrapper);

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Organization Name'), {
      target: { value: 'Testing Org' },
    });
    fireEvent.change(screen.getByPlaceholderText('Your name'), {
      target: { value: 'Amisha' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'amisha@gmail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), {
      target: { value: '+917834811114' },
    });
    fireEvent.change(screen.getByPlaceholderText('Create password'), {
      target: { value: 'Secret1234!' },
    });

    // Send OTP
    fireEvent.click(screen.getByText('get otp'));

    await waitFor(() => {
      expect(screen.getByText('resend otp')).toBeInTheDocument();
    });

    // Enter OTP
    fireEvent.change(screen.getByPlaceholderText('Enter OTP'), {
      target: { value: '123456' },
    });

    // Submit
    fireEvent.click(screen.getByTestId('StartTrialButton'));

    await waitFor(() => {
      expect(screen.getByText('Trial account created successfully! Redirecting to login...')).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(window.location.href).toBe('https://testorg.glific.com/login');
      },
      { timeout: 3000 }
    );
  });

  test('should show error when no trial accounts available', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
      },
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: false,
        error: 'No trial accounts available at the moment',
      },
    });

    render(wrapper);

    // Fill form and send OTP
    fireEvent.change(screen.getByPlaceholderText('Organization Name'), {
      target: { value: 'Testing Org' },
    });
    fireEvent.change(screen.getByPlaceholderText('Your name'), {
      target: { value: 'Amisha' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'amisha@gmail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), {
      target: { value: '+917834811114' },
    });
    fireEvent.change(screen.getByPlaceholderText('Create password'), {
      target: { value: 'Secret1234!' },
    });

    fireEvent.click(screen.getByText('get otp'));

    await waitFor(() => {
      expect(screen.getByText('resend otp')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Enter OTP'), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByTestId('StartTrialButton'));

    await waitFor(() => {
      expect(screen.getByText('No trial accounts available at the moment')).toBeInTheDocument();
    });
  });

  test('should show error for invalid OTP', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
      },
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: false,
        error: 'Invalid OTP',
      },
    });

    render(wrapper);

    // Fill and submit with wrong OTP
    fireEvent.change(screen.getByPlaceholderText('Organization Name'), {
      target: { value: 'Testing Org' },
    });
    fireEvent.change(screen.getByPlaceholderText('Your name'), {
      target: { value: 'Amisha' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'amisha@gmail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), {
      target: { value: '+917834811114' },
    });
    fireEvent.change(screen.getByPlaceholderText('Create password'), {
      target: { value: 'Secret1234!' },
    });

    fireEvent.click(screen.getByText('get otp'));

    await waitFor(() => {
      expect(screen.getByText('resend otp')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Enter OTP'), {
      target: { value: 'wrong' },
    });

    fireEvent.click(screen.getByTestId('StartTrialButton'));

    await waitFor(() => {
      expect(screen.getByText('Invalid OTP')).toBeInTheDocument();
    });
  });
});
