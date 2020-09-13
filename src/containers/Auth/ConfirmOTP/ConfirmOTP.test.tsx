import React from 'react';
import { render } from '@testing-library/react';
import axios from 'axios';

import { ConfirmOTP } from './ConfirmOTP';
import { MemoryRouter } from 'react-router';

jest.mock('axios');

describe('<ConfirmOTP />', () => {
  it('renders component properly', () => {
    const { getByText, findByTestId } = render(
      <MemoryRouter>
        <ConfirmOTP location={undefined} />
      </MemoryRouter>
    );
    const authContainer = findByTestId('AuthContainer');
    expect(authContainer).toHaveTextContent('Create your new account');
  });
});
