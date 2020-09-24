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

  test('generate OTP', async () => {
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

    const input = container.querySelector('input[type="text"]');
    UserEvent.type(input, '76554');
    await wait();

    const password = container.querySelector('input[type="password"]');
    UserEvent.type(password, 'pass123456');
    await wait();

    // click on save button
    const saveButton = screen.getByText('SAVE');
    UserEvent.click(saveButton);
    await wait();
  });
});
