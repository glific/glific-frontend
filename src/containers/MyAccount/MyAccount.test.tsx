import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import axios from 'axios';
import { MemoryRouter } from 'react-router';

import { getCurrentUserQuery, updateUserQuery } from 'mocks/User';
import { getOrganizationLanguagesQuery } from 'mocks/Organization';
import { MyAccount } from './MyAccount';

const mocks = [
  getCurrentUserQuery,
  ...updateUserQuery,
  getCurrentUserQuery,
  getOrganizationLanguagesQuery,
  getOrganizationLanguagesQuery,
];

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <MyAccount />
    </MemoryRouter>
  </MockedProvider>
);

describe('<MyAccount />', () => {
  test('it should render', async () => {
    const { getByText, findByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    const myAccount = await findByTestId('MyAccount');
    expect(myAccount).toHaveTextContent('Change Password');
  });

  test('generate OTP success flow', async () => {
    const { container } = render(wrapper);

    // let's mock successful sending of OTP
    const responseData = { data: { data: { data: {} } } };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));

    await waitFor(() => {
      // click on generate OTP
      const generateOTPButton = screen.getByText('Generate OTP');
      UserEvent.click(generateOTPButton);
    });

    // set the mock
    const resendPasswordResponse = {
      data: { message: 'OTP sent successfully to 919967665667', phone: '919967665667' },
    };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(resendPasswordResponse));

    await waitFor(() => {
      // click on resend button
      const resendButton = screen.getByTestId('resendOtp');
      UserEvent.click(resendButton);
    });

    // trigger validation errors
    await waitFor(() => {
      // click on save button
      const saveButton = screen.getByText('Save');
      UserEvent.click(saveButton);
    });

    // check for validation errors
    await waitFor(() => {
      expect(screen.getAllByText('Input required')).toHaveLength(2);
    });

    const dropdown = screen.getByTestId('dropdown');
    const { getByRole } = within(dropdown);
    const inputDropdown = getByRole('button');
    fireEvent.mouseDown(inputDropdown);
    const [english, hindi] = screen.getAllByRole('option');
    hindi.click();

    // enter otp
    const input = container.querySelector('input[type="text"]') as HTMLInputElement;
    UserEvent.type(input, '76554');

    // enter password
    const password = container.querySelector('input[type="password"]') as HTMLInputElement;
    UserEvent.type(password, 'pass123456');

    await waitFor(() => {
      // view password
      const passwordToggle = screen.getByTestId('passwordToggle');
      UserEvent.click(passwordToggle);

      // click on save button
      const saveButton = screen.getByText('Save');
      UserEvent.click(saveButton);
    });

    // assert successful save
    // await waitFor(() => {
    //   expect(screen.getByText('Password updated successfully!')).toBeInTheDocument();
    // });
  });

  test('generate OTP error response', async () => {
    const { findByTestId } = render(wrapper);

    // let's mock error case sending of OTP
    const errorMessage = 'Cannot register 919967665667';
    mockedAxios.post.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));

    await waitFor(() => {
      // click on generate OTP
      const generateOTPButton = screen.getByText('Generate OTP');
      UserEvent.click(generateOTPButton);
    });

    // close the alert
    const closeAlert = await findByTestId('crossIcon');
    UserEvent.click(closeAlert);
  });

  test('generate OTP success flow with cancel', async () => {
    render(wrapper);

    // let's mock successful sending of OTP
    const responseData = { data: { data: { data: {} } } };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));

    await waitFor(() => {
      // click on generate OTP
      const generateOTPButton = screen.getByText('Generate OTP');
      UserEvent.click(generateOTPButton);
    });

    // click on CANCEL button

    await waitFor(() => {
      const cancelButton = screen.getByText('Cancel');
      UserEvent.click(cancelButton);
    });
  });

  test('generate OTP error with incorrect OTP', async () => {
    const user = UserEvent.setup();
    const { container } = render(wrapper);

    // let's mock successful sending of OTP
    const responseData = { data: { data: { data: {} } } };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));

    await waitFor(() => {
      // click on generate OTP
      const generateOTPButton = screen.getByText('Generate OTP');
      UserEvent.click(generateOTPButton);
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
      const saveButton = screen.getByText('Save');
      UserEvent.click(saveButton);
    });

    // assert for incorrect OTP
    // await waitFor(() => {
    //   expect(screen.getByText('Please enter a valid OTP')).toBeInTheDocument();
    // });
  });

  test('generate OTP error with too many attempts', async () => {
    const user = UserEvent.setup();
    const { container } = render(wrapper);

    // let's mock successful sending of OTP
    const responseData = { data: { data: { data: {} } } };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));

    await waitFor(() => {
      // click on generate OTP
      const generateOTPButton = screen.getByText('Generate OTP');
      UserEvent.click(generateOTPButton);
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
      const saveButton = screen.getByText('Save');
      UserEvent.click(saveButton);
    });
  });
});
