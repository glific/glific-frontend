import React from 'react';
import { render, screen, wait } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import axios from 'axios';

import { ResetPasswordPhone } from './ResetPasswordPhone';

jest.mock('axios');

const wrapper = (
  <MemoryRouter>
    <ResetPasswordPhone />
  </MemoryRouter>
);

describe('<ResetPasswordPhone />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('it should render correctly', async () => {
    const { findByTestId } = render(wrapper);

    const resetPassword = await findByTestId('AuthContainer');
    expect(resetPassword).toHaveTextContent('Reset your password');
    expect(resetPassword).toHaveTextContent('GENERATE OTP TO CONFIRM');
  });

  it('test the form submission with phone', async () => {
    render(wrapper);

    // enter the phone
    const input = screen.getByRole('textbox');
    UserEvent.type(input, '+919978776554');

    // click on continue
    const continueButton = screen.getByText('GENERATE OTP TO CONFIRM');
    UserEvent.click(continueButton);

    // let's mock successful login submission
    const responseData = { data: { data: { data: {} } } };
    axios.post.mockImplementationOnce(() => Promise.resolve(responseData));
    await wait();
  });

  it('test the form submission with incorrect phone', async () => {
    render(wrapper);

    // enter the phone
    const input = screen.getByRole('textbox');
    UserEvent.type(input, '+919978776554');

    // click on GENERATE button
    const continueButton = screen.getByText('GENERATE OTP TO CONFIRM');
    UserEvent.click(continueButton);

    // set the mock
    const errorMessage = 'Cannot send the otp to 919978776554';
    axios.post.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
    await wait();
  });
});
