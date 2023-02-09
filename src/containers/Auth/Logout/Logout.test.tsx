import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import { Logout } from './Logout';
import { MockedProvider } from '@apollo/client/testing';

vi.mock('axios', () => {
  return {
    defaults: { headers: { common: {} } },
    get: vi.fn(),
    delete: vi.fn(),
  };
});

describe('<Logout />', () => {
  test('it should logout user', async () => {
    render(
      <MockedProvider>
        <MemoryRouter>
          <Logout />
        </MemoryRouter>
      </MockedProvider>
    );
  });

  test('it should render component and click login', async () => {
    render(
      <MockedProvider>
        <MemoryRouter>
          <Logout />
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      const button = screen.getByTestId('ok-button');
      fireEvent.click(button);
    });
  });
});
