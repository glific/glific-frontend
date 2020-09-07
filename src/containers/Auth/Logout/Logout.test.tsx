import React from 'react';
import { render } from '@testing-library/react';

import { Logout } from './Logout';

describe('<Logout />', () => {
  test('it should mount', () => {
    render(<Logout />);
  });
});
