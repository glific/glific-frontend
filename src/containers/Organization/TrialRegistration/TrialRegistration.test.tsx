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
    // Auth component calls axios.post(ORGANIZATION_NAME) on mount
    mockedAxios.post.mockResolvedValue({
      data: { data: { name: 'Glific', status: 'active' } },
    });
  });

  test('should render TrialRegistration component', async () => {
    render(wrapper);

    expect(await screen.findByText('Start Your Glific Trial')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Organization Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone Number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create password')).toBeInTheDocument();
    expect(screen.getByTestId('SubmitButton')).toHaveTextContent('Get OTP');
    expect(screen.queryByPlaceholderText('Enter OTP')).not.toBeInTheDocument();
  });

  test('should show validation errors for empty fields', async () => {
    render(wrapper);

    const submitButton = await screen.findByTestId('SubmitButton');
    fireEvent.click(submitButton);

    expect(await screen.findByText('Organization name is required')).toBeInTheDocument();
  });

  test('should show validation error for invalid organization name', async () => {
    render(wrapper);

    const orgNameInput = await screen.findByPlaceholderText('Organization Name');
    fireEvent.change(orgNameInput, { target: { value: '123' } });
    fireEvent.blur(orgNameInput);

    expect(
      await screen.findByText('Organization name can only contain alphabets and spaces')
    ).toBeInTheDocument();
  });

  test('should show validation error for invalid username', async () => {
    render(wrapper);

    const usernameInput = await screen.findByPlaceholderText('Your name');
    fireEvent.change(usernameInput, { target: { value: 'test123' } });
    fireEvent.blur(usernameInput);

    expect(
      await screen.findByText('Name can only contain alphabets and spaces')
    ).toBeInTheDocument();
  });

  test('should send OTP successfully and show OTP field', async () => {
    // First call: ORGANIZATION_NAME (on mount), Second call: OTP send
    mockedAxios.post
      .mockResolvedValueOnce({ data: { data: { name: 'Glific', status: 'active' } } })
      .mockResolvedValueOnce({
        data: {
          data: {
            message: 'OTP sent successfully to amisha@gmail.com',
          },
        },
      });

    render(wrapper);

    const orgInput = await screen.findByPlaceholderText('Organization Name');
    fireEvent.change(orgInput, { target: { value: 'Testing Org' } });
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

    // OTP field appears after successful OTP send
    expect(await screen.findByPlaceholderText('Enter OTP')).toBeInTheDocument();
    expect(screen.getByText('Resend')).toBeInTheDocument();
    expect(screen.getByTestId('SubmitButton')).toHaveTextContent('Start Trial');
  });

  test('should show error when user already exists', async () => {
    // First call: ORGANIZATION_NAME (on mount), Second call: OTP send (error)
    mockedAxios.post
      .mockResolvedValueOnce({ data: { data: { name: 'Glific', status: 'active' } } })
      .mockResolvedValueOnce({
        data: {
          success: false,
          error: 'User with this email or phone already exists',
        },
      });

    render(wrapper);

    const orgInput = await screen.findByPlaceholderText('Organization Name');
    fireEvent.change(orgInput, { target: { value: 'Testing Org' } });
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

    fireEvent.click(screen.getByTestId('SubmitButton'));

    expect(
      await screen.findByText('User with this email or phone already exists')
    ).toBeInTheDocument();
  });

  test('should show error when no trial accounts available', async () => {
    // First call: ORGANIZATION_NAME, Second: OTP send, Third: allocate account (error)
    mockedAxios.post
      .mockResolvedValueOnce({ data: { data: { name: 'Glific', status: 'active' } } })
      .mockResolvedValueOnce({
        data: {
          data: {
            message: 'OTP sent successfully',
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: false,
          error: 'No trial accounts available at the moment',
        },
      });

    render(wrapper);

    const orgInput = await screen.findByPlaceholderText('Organization Name');
    fireEvent.change(orgInput, { target: { value: 'Testing Org' } });
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

    expect(await screen.findByPlaceholderText('Enter OTP')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Enter OTP'), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByTestId('SubmitButton'));

    expect(
      await screen.findByText('No trial accounts available at the moment')
    ).toBeInTheDocument();
  });

  test('should show error for invalid OTP', async () => {
    // First call: ORGANIZATION_NAME, Second: OTP send, Third: allocate account (error)
    mockedAxios.post
      .mockResolvedValueOnce({ data: { data: { name: 'Glific', status: 'active' } } })
      .mockResolvedValueOnce({
        data: {
          data: {
            message: 'OTP sent successfully',
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: false,
          error: 'Invalid OTP',
        },
      });

    render(wrapper);

    const orgInput = await screen.findByPlaceholderText('Organization Name');
    fireEvent.change(orgInput, { target: { value: 'Testing Org' } });
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

    expect(await screen.findByPlaceholderText('Enter OTP')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Enter OTP'), {
      target: { value: 'wrong' },
    });

    fireEvent.click(screen.getByTestId('SubmitButton'));

    expect(await screen.findByText('Invalid OTP')).toBeInTheDocument();
  });
});
