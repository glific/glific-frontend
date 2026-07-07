import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import axios from 'axios';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import { getCurrentUserQuery, updateUserQuery, updateEmailQuery, updateEmailErrorQuery } from 'mocks/User';
import { getOrganizationLanguagesQuery } from 'mocks/Organization';
import { MyAccount } from './MyAccount';

const mocks = [
  getCurrentUserQuery,
  ...updateUserQuery,
  getCurrentUserQuery,
  getOrganizationLanguagesQuery,
  getOrganizationLanguagesQuery,
];

vi.mock('axios');
const mockedAxios = axios as any;
const user = userEvent.setup();

const renderMyAccount = (mockedResponses: any[] = mocks) =>
  render(
    <MockedProvider mocks={mockedResponses} addTypename={false}>
      <MemoryRouter>
        <MyAccount />
      </MemoryRouter>
    </MockedProvider>
  );

describe('<MyAccount />', () => {
  test('it should render', async () => {
    const { getByText, findByTestId } = renderMyAccount();

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    const myAccount = await findByTestId('MyAccount');
    expect(myAccount).toHaveTextContent('Change Password');
  });

  test('generate OTP success flow', async () => {
    // let's mock successful sending of OTP
    const responseData = { data: { data: { data: {} } } };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));
    renderMyAccount();

    await waitFor(() => {
      // click on generate OTP
      const generateOTPButton = screen.getByText('Generate OTP');
      user.click(generateOTPButton);
    });

    // set the mock
    const resendPasswordResponse = {
      data: { message: 'OTP sent successfully to 919967665667', phone: '919967665667' },
    };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(resendPasswordResponse));

    await waitFor(() => {
      // click on resend button
      const resendButton = screen.getByTestId('resendOtp');
      user.click(resendButton);
    });

    // trigger validation errors
    await waitFor(() => {
      // click on save button
      const saveButton = screen.getByText('Save');
      user.click(saveButton);
    });

    // check for validation errors
    await waitFor(() => {
      expect(screen.getAllByText('Input required')).toHaveLength(2);
    });

    await waitFor(() => {
      const dropdown = screen.getByTestId('dropdown');
      const { getByRole } = within(dropdown);
      const inputDropdown = getByRole('combobox');
      fireEvent.mouseDown(inputDropdown);
    });
    const [english, hindi] = screen.getAllByRole('option');

    await waitFor(() => {
      hindi.click();
      expect(screen.getByText('Language changed successfully!')).toBeInTheDocument();
    });
  });

  test('generate OTP error response', async () => {
    const { findByTestId } = renderMyAccount();

    // let's mock error case sending of OTP
    const errorMessage = 'Cannot register 919967665667';
    mockedAxios.post.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));

    await waitFor(() => {
      // click on generate OTP
      const generateOTPButton = screen.getByText('Generate OTP');
      user.click(generateOTPButton);
    });

    // close the alert
    await waitFor(() => {
      expect(screen.getByTestId('crossIcon')).toBeInTheDocument();
    });
    const closeAlert = screen.getByTestId('crossIcon');
    await user.click(closeAlert);
  });

  test('generate OTP success flow with cancel', async () => {
    renderMyAccount();

    // let's mock successful sending of OTP
    const responseData = { data: { data: { data: {} } } };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));

    await waitFor(() => {
      // click on generate OTP
      const generateOTPButton = screen.getByText('Generate OTP');
      user.click(generateOTPButton);
    });

    await waitFor(() => {
      // click on cancel button
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
    const cancelButton = screen.getByText('Cancel');
    user.click(cancelButton);
  });

  test('generate OTP error with incorrect OTP', async () => {
    const { container } = renderMyAccount();

    // let's mock successful sending of OTP
    const responseData = { data: { data: { data: {} } } };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));

    await waitFor(() => {
      // click on generate OTP
      const generateOTPButton = screen.getByText('Generate OTP');
      user.click(generateOTPButton);
    });

    // enter otp
    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    await user.click(input);
    await user.keyboard('1234');

    // enter password
    const password = container.querySelector('input[type="password"]') as HTMLInputElement;
    await user.click(password);
    await user.keyboard('pass123456');

    await waitFor(() => {
      // click on save button
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    // assert for incorrect OTP
    // await waitFor(() => {
    //   expect(screen.getByText('Please enter a valid OTP')).toBeInTheDocument();
    // });
  });

  test('generate OTP error with too many attempts', async () => {
    const { container } = renderMyAccount();

    // let's mock successful sending of OTP
    const responseData = { data: { data: { data: {} } } };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));

    await waitFor(() => {
      // click on generate OTP
      const generateOTPButton = screen.getByText('Generate OTP');
      user.click(generateOTPButton);
    });

    // enter otp
    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    await user.click(input);
    await user.keyboard('4567');

    // enter password
    const password = container.querySelector('input[type="password"]') as HTMLInputElement;
    await user.click(password);
    await user.keyboard('pass123456');

    await waitFor(() => {
      // click on save button
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);
  });

  test('editing and saving email succeeds', async () => {
    const emailMocks = [getCurrentUserQuery, updateEmailQuery, getOrganizationLanguagesQuery];
    const { container } = renderMyAccount(emailMocks);

    await waitFor(() => {
      expect(screen.getByTestId('MyAccount')).toBeInTheDocument();
    });

    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement;
    await user.clear(emailInput);
    await user.type(emailInput, 'newemail@domain.com');

    const updateEmailButton = screen.getByTestId('updateEmailButton');
    await user.click(updateEmailButton);

    await waitFor(() => {
      expect(screen.getByText('Email updated successfully!')).toBeInTheDocument();
    });
  });

  test('editing email surfaces a backend validation error instead of a false success toast', async () => {
    const emailMocks = [getCurrentUserQuery, updateEmailErrorQuery, getOrganizationLanguagesQuery];
    const { container } = renderMyAccount(emailMocks);

    await waitFor(() => {
      expect(screen.getByTestId('MyAccount')).toBeInTheDocument();
    });

    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement;
    await user.clear(emailInput);
    await user.type(emailInput, 'taken@domain.com');

    const updateEmailButton = screen.getByTestId('updateEmailButton');
    await user.click(updateEmailButton);

    await waitFor(() => {
      expect(screen.getByText('has already been taken')).toBeInTheDocument();
    });
    expect(screen.queryByText('Email updated successfully!')).not.toBeInTheDocument();
  });
});
