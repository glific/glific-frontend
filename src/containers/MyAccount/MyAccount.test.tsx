import React from 'react';
import { render, screen, wait } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import axios from 'axios';

import { MyAccount } from './MyAccount';
import { MY_ACCOUNT_MOCKS } from './MyAccount.test.helper';

const mocks = MY_ACCOUNT_MOCKS;

jest.mock('axios');
const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MyAccount />
  </MockedProvider>
);

describe('<MyAccount />', () => {
  test('it should mount', async () => {
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
});
