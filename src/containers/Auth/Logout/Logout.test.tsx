import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { Logout } from './Logout';

describe('<Logout />', () => {
  test('it should render', () => {
    render(
      <MemoryRouter>
        <Logout />
      </MemoryRouter>
    );
  });
});
