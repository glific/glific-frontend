import React from 'react';
import { render, screen } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

import { Registration } from './Registration';

jest.mock('axios');

const wrapper = (
  <MemoryRouter>
    <Registration />
  </MemoryRouter>
);

describe('<Registration />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('it should mount', async () => {
    const { findByTestId } = render(wrapper);

    const registration = await findByTestId('AuthContainer');
    expect(registration).toHaveTextContent('Create your new account');
  });
});
