import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter } from 'react-router';
import axios from 'axios';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
      expect(screen.getByText('Start Your Glific Trial')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Organization Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Phone Number')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Create password')).toBeInTheDocument();
      expect(screen.getByTestId('SubmitButton')).toHaveTextContent('Get OTP');
      expect(screen.queryByPlaceholderText('Enter OTP')).not.toBeInTheDocument();
    });
  });

  test('should show validation errors for empty fields', async () => {
    render(wrapper);

    const submitButton = screen.getByTestId('SubmitButton');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Organization name is required')).toBeInTheDocument();
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

  test('should send OTP successfully and show OTP field', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
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

    const submitButton = screen.getByTestId('SubmitButton');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('OTP sent successfully to amisha@gmail.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
      expect(screen.getByText('Resend')).toBeInTheDocument();
      expect(screen.getByTestId('SubmitButton')).toHaveTextContent('Start Trial');
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

    const submitButton = screen.getByTestId('SubmitButton');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('User with this email or phone already exists')).toBeInTheDocument();
    });
  });

  test('should show error when no trial accounts available', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        data: {
          message: 'OTP sent successfully',
        },
      },
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: false,
        error: 'No trial accounts available at the moment',
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

    fireEvent.click(screen.getByTestId('SubmitButton'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Enter OTP'), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByTestId('SubmitButton'));

    await waitFor(() => {
      expect(screen.getByText('No trial accounts available at the moment')).toBeInTheDocument();
    });
  });

  test('should show error for invalid OTP', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        data: {
          message: 'OTP sent successfully',
        },
      },
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: false,
        error: 'Invalid OTP',
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

    fireEvent.click(screen.getByTestId('SubmitButton'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Enter OTP'), {
      target: { value: 'wrong' },
    });

    fireEvent.click(screen.getByTestId('SubmitButton'));

    await waitFor(() => {
      expect(screen.getByText('Invalid OTP')).toBeInTheDocument();
    });
  });
});
