import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import axios from 'axios';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import { getCurrentUserQuery, updateUserQuery, updateUserNetworkErrorQuery } from 'mocks/User';
import { getOrganizationLanguagesQuery } from 'mocks/Organization';
import * as Notification from 'common/notification';
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

const renderMyAccount = (mocksOverride: any[] = mocks) =>
  render(
    <MockedProvider mocks={mocksOverride} addTypename={false}>
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
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
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

    hindi.click();

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Language changed successfully!', 'success');
    });
  });

  test('generate OTP error response', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
    renderMyAccount();

    // let's mock error case sending of OTP
    const errorMessage = 'Cannot register 919967665667';
    mockedAxios.post.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));

    await waitFor(() => {
      // click on generate OTP
      const generateOTPButton = screen.getByText('Generate OTP');
      user.click(generateOTPButton);
    });

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Unable to send an OTP to +919820198765.', 'error');
    });
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
    user.click(input);
    user.keyboard('1234');

    // enter password
    const password = container.querySelector('input[type="password"]') as HTMLInputElement;
    user.click(password);
    user.keyboard('pass123456');

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
    user.click(input);
    user.keyboard('4567');

    // enter password
    const password = container.querySelector('input[type="password"]') as HTMLInputElement;
    user.click(password);
    user.keyboard('pass123456');

    await waitFor(() => {
      // click on save button
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);
  });

  test('updates the password successfully', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
    const { container } = renderMyAccount();

    const responseData = { data: { data: { data: {} } } };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));

    await waitFor(() => {
      const generateOTPButton = screen.getByText('Generate OTP');
      user.click(generateOTPButton);
    });

    const input = await screen.findByPlaceholderText('OTP');
    await user.click(input);
    await user.keyboard('76554');

    const password = container.querySelector('input[type="password"]') as HTMLInputElement;
    await user.click(password);
    await user.keyboard('Pass123456!');

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Password updated successfully!', 'success');
    });
  });

  test('shows a generic error when updating the password fails unexpectedly', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
    const { container } = renderMyAccount([
      getCurrentUserQuery,
      updateUserNetworkErrorQuery,
      getOrganizationLanguagesQuery,
    ]);

    const responseData = { data: { data: { data: {} } } };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));

    await waitFor(() => {
      const generateOTPButton = screen.getByText('Generate OTP');
      user.click(generateOTPButton);
    });

    const input = await screen.findByPlaceholderText('OTP');
    await user.click(input);
    await user.keyboard('76554');

    const password = container.querySelector('input[type="password"]') as HTMLInputElement;
    await user.click(password);
    await user.keyboard('Pass123456!');

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Sorry! An error occurred!', 'error');
    });
  });
});
