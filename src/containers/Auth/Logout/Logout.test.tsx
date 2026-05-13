import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import { Logout } from './Logout';
import { MockedProvider } from '@apollo/client/testing';
import { ORG_EVAL_ACCESS_CACHE_KEY } from 'containers/AIEvals/orgEvalAccessCache';

vi.mock('axios');

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

  test('it should clear org eval access request key from session storage on logout', async () => {
    sessionStorage.setItem(ORG_EVAL_ACCESS_CACHE_KEY, JSON.stringify({ status: 'pending' }));

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

    expect(sessionStorage.getItem(ORG_EVAL_ACCESS_CACHE_KEY)).toBeNull();
  });
});
