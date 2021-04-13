import React from 'react';
import { render, screen, wait } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import axios from 'axios';
import { MemoryRouter } from 'react-router';

import { MyAccount } from './MyAccount';
import { getCurrentUserQuery, updateUserQuery } from '../../mocks/User';
import { getOrganizationLanguagesQuery } from '../../mocks/Organization';

const mocks = [getCurrentUserQuery, ...updateUserQuery, getOrganizationLanguagesQuery];

jest.mock('axios');
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
    const { container, findByTestId } = render(wrapper);

    await wait();

    // let's mock successful sending of OTP
    const responseData = { data: { data: { data: {} } } };
    axios.post.mockImplementationOnce(() => Promise.resolve(responseData));
    await wait();

    // click on generate OTP
    const generateOTPButton = screen.getByText('GENERATE OTP');
    UserEvent.click(generateOTPButton);
    await wait();

    // set the mock
    const resendPasswordResponse = {
      data: { message: 'OTP sent successfully to 919967665667', phone: '919967665667' },
    };
    axios.post.mockImplementationOnce(() => Promise.resolve(resendPasswordResponse));
    await wait();

    // click on resend button
    const resendButton = screen.getByTestId('resendOtp');
    UserEvent.click(resendButton);

    // enter otp
    const input = container.querySelector('input[type="text"]');
    UserEvent.type(input, '76554');
    await wait();

    // enter password
    const password = container.querySelector('input[type="password"]');
    UserEvent.type(password, 'pass123456');
    await wait();

    // view password
    const passwordToggle = await findByTestId('passwordToggle');
    UserEvent.click(passwordToggle);
    await wait();

    // click on save button
    const saveButton = screen.getByText('SAVE');
    UserEvent.click(saveButton);
    await wait();
  });

  test('generate OTP error response', async () => {
    const { findByTestId } = render(wrapper);

    await wait();

    // let's mock error case sending of OTP
    const errorMessage = 'Cannot register 919967665667';
    axios.post.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
    await wait();

    // click on generate OTP
    const generateOTPButton = screen.getByText('GENERATE OTP');
    UserEvent.click(generateOTPButton);
    await wait();

    // close the alert
    const closeAlert = await findByTestId('crossIcon');
    UserEvent.click(closeAlert);
    await wait();
  });

  test('generate OTP success flow with cancel', async () => {
    render(wrapper);

    await wait();

    // let's mock successful sending of OTP
    const responseData = { data: { data: { data: {} } } };
    axios.post.mockImplementationOnce(() => Promise.resolve(responseData));
    await wait();

    // click on generate OTP
    const generateOTPButton = screen.getByText('GENERATE OTP');
    UserEvent.click(generateOTPButton);
    await wait();

    // click on CANCEL button
    const cancelButton = screen.getByText('CANCEL');
    UserEvent.click(cancelButton);
    await wait();
  });

  test('generate OTP error with incorrect OTP', async () => {
    const { container } = render(wrapper);

    await wait();

    // let's mock successful sending of OTP
    const responseData = { data: { data: { data: {} } } };
    axios.post.mockImplementationOnce(() => Promise.resolve(responseData));
    await wait();

    // click on generate OTP
    const generateOTPButton = screen.getByText('GENERATE OTP');
    UserEvent.click(generateOTPButton);
    await wait();

    // enter otp
    const input = container.querySelector('input[type="text"]');
    UserEvent.type(input, '1234');
    await wait();

    // enter password
    const password = container.querySelector('input[type="password"]');
    UserEvent.type(password, 'pass123456');
    await wait();

    // click on save button
    const saveButton = screen.getByText('SAVE');
    UserEvent.click(saveButton);
    await wait();
  });

  test('generate OTP error with too many attempts', async () => {
    const { container } = render(wrapper);

    await wait();

    // let's mock successful sending of OTP
    const responseData = { data: { data: { data: {} } } };
    axios.post.mockImplementationOnce(() => Promise.resolve(responseData));
    await wait();

    // click on generate OTP
    const generateOTPButton = screen.getByText('GENERATE OTP');
    UserEvent.click(generateOTPButton);
    await wait();

    // enter otp
    const input = container.querySelector('input[type="text"]');
    UserEvent.type(input, '4567');
    await wait();

    // enter password
    const password = container.querySelector('input[type="password"]');
    UserEvent.type(password, 'pass123456');
    await wait();

    // click on save button
    const saveButton = screen.getByText('SAVE');
    UserEvent.click(saveButton);
    await wait();
  });
});
