import React from 'react';
import { render, screen } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';

import { MyAccount } from './MyAccount';
import { MY_ACCOUNT_MOCKS } from './MyAccount.test.helper';

const mocks = MY_ACCOUNT_MOCKS;

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
    const { getByText, findByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    // click on generate OTP
    const generateOTPButton = await findByTestId('generateOTP');
    UserEvent.click(generateOTPButton);
  });
});
