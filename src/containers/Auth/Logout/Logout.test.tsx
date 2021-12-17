import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { Logout } from './Logout';
import { MockedProvider } from '@apollo/client/testing';

jest.mock('axios', () => {
  return {
    defaults: { headers: { common: {} } },
    get: jest.fn(),
    delete: jest.fn(),
  };
});

describe('<Logout />', () => {
  test('it should logout user', async () => {
    render(
      <MockedProvider>
        <MemoryRouter>
          <Logout match={{ params: { mode: 'user' } }} />
        </MemoryRouter>
      </MockedProvider>
    );
  });

  test('it should render component and click login', async () => {
    render(
      <MockedProvider>
        <MemoryRouter>
          <Logout match={{ params: { mode: '' } }} />
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      const button = screen.getByText('Login');
      fireEvent.click(button);
    });
  });
});
