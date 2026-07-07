import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';

import { Logout } from './Logout';
import { MockedProvider } from '@apollo/client/testing';
import { ORG_EVAL_ACCESS_CACHE_KEY } from 'containers/AIEvals/orgEvalAccessCache';

vi.mock('axios');

describe('<Logout />', () => {
  const originalLocation = window.location;
  let locationReplaceMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    locationReplaceMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { ...originalLocation, replace: locationReplaceMock },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: originalLocation,
    });
  });

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

  test('it should clear org eval access request key from local storage on logout', async () => {
    localStorage.setItem(ORG_EVAL_ACCESS_CACHE_KEY, JSON.stringify({ status: 'pending' }));

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

    expect(localStorage.getItem(ORG_EVAL_ACCESS_CACHE_KEY)).toBeNull();
  });

  test('redirects to login with window.location.replace when session expires dialog is confirmed', async () => {
    render(
      <MockedProvider>
        <MemoryRouter>
          <Logout />
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByTestId('ok-button'));
    });

    expect(locationReplaceMock).toHaveBeenCalledWith('/login');
  });

  test('redirects to login with window.location.replace on user-initiated logout', async () => {
    render(
      <MockedProvider>
        <MemoryRouter initialEntries={['/logout/user']}>
          <Routes>
            <Route path="/logout/:mode" element={<Logout />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(locationReplaceMock).toHaveBeenCalledWith('/login');
    });
  });
});
