import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { ResetPasswordConfirmOTP } from './ResetPasswordConfirmOTP';

const defaultProps = { location: { state: { phoneNumber: '918787654567' } } };

const wrapper = (
  <MemoryRouter>
    <ResetPasswordConfirmOTP {...defaultProps} />
  </MemoryRouter>
);

describe('<ResetPasswordConfirmOTP />', () => {
  test('it should mount', async () => {
    const { findByTestId } = render(wrapper);

    const resetPassword = await findByTestId('AuthContainer');
    expect(resetPassword).toHaveTextContent('Reset your password');
    expect(resetPassword).toHaveTextContent('New Password');
  });
});
