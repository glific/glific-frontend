import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { Logout } from './Logout';
import { MockedProvider } from '@apollo/client/testing';

describe('<Logout />', () => {
  test('it should render', () => {
    render(
      <MockedProvider>
        <MemoryRouter>
          <Logout match={{ params: { mode: 'user' } }} />
        </MemoryRouter>
      </MockedProvider>
    );
  });
});
