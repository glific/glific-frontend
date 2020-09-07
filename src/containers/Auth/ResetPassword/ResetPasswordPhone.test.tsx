import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { ResetPasswordPhone } from './ResetPasswordPhone';

const wrapper = (
  <MemoryRouter>
    <ResetPasswordPhone />
  </MemoryRouter>
);

describe('<ResetPasswordPhone />', () => {
  test('it should mount', async () => {
    const { findByTestId } = render(wrapper);

    const resetPassword = await findByTestId('AuthContainer');
    expect(resetPassword).toHaveTextContent('Reset your password');
    expect(resetPassword).toHaveTextContent('GENERATE OTP TO CONFIRM');
  });
});
