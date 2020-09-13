import React from 'react';
import { render, screen } from '@testing-library/react';
import axios from 'axios';

import { ConfirmOTP } from './ConfirmOTP';
import { MemoryRouter } from 'react-router';

jest.mock('axios');

const defaultProps = { location: { state: { name: '', phoneNumber: '', password: '' } } };

describe('<ConfirmOTP />', () => {
  it('renders component properly', async () => {
    const { findByTestId } = render(
      <MemoryRouter>
        <ConfirmOTP {...defaultProps} />
      </MemoryRouter>
    );
    const authContainer = await findByTestId('AuthContainer');
    expect(authContainer).toHaveTextContent(
      'Please confirm the OTP received at your whatsapp number.'
    );
  });
});
